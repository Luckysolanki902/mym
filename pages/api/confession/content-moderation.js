const toxicityThreshold = 0.5;
const severeToxicityThreshold = 0.5;
const identityAttackThreshold = 0.5;
const insultThreshold = 0.5;
const threatThreshold = 0.5;

export default async function handler(req, res) {

    const { confessionContent } = req.body;
    if (!confessionContent) {
        return res.status(400).json({ error: 'Missing confession content' });
    }

    const { isFitForSubmission, problematicSentences, warning, advice } = await analyzeFullContent(confessionContent);
    res.status(200).json({ isFitForSubmission, problematicSentences, warning, advice });
}

async function analyzeFullContent(content) {
    const result = await analyzeSentence(content);

    if (result.isFitForSubmission) {
        return { isFitForSubmission: true, problematicSentences: [], warning: '', advice: '' };
    } else {
        // If full content fails, analyze each sentence
        const sentences = content.split(/[.,!?\\n]+/).filter(sentence => sentence.trim().length > 0);

        const problematicSentences = [];
        let warning = '';
        let advice = '';

        for (const sentence of sentences) {
            const result = await analyzeSentence(sentence);

            if (!result.isFitForSubmission) {
                problematicSentences.push(sentence);
                warning = result.warning;
                advice = result.advice;
            }
        }

        return { isFitForSubmission: false, problematicSentences, warning, advice };
    }
}

async function analyzeSentence(sentence) {
    if (!sentence || sentence.trim().length === 0) {
        console.warn('Skipping empty or invalid sentence:', sentence);
        return { isFitForSubmission: true, warning: '', advice: '' };
    }

    const apiKey = process.env.PERSPECTIVE_API_KEY;


    const response = await fetch(`https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            comment: {
                text: sentence,
            },
            languages: ['en', 'hi-Latn'],
            requestedAttributes: {
                TOXICITY: {},
                SEVERE_TOXICITY: {},
                IDENTITY_ATTACK: {},
                INSULT: {},
                THREAT: {},
            },
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('API response error:', response.status, response.statusText, data);
        return { isFitForSubmission: true, warning: '', advice: '' };
    }

    if (!data || !data.attributeScores) {
        console.error('Invalid data received from API:', data);
        return { isFitForSubmission: true, warning: '', advice: '' };
    }


    const attributeScores = {
        insult: data.attributeScores?.INSULT?.summaryScore?.value || 0,
        threat: data.attributeScores?.THREAT?.summaryScore?.value || 0,
        severeToxicity: data.attributeScores?.SEVERE_TOXICITY?.summaryScore?.value || 0,
        identityAttack: data.attributeScores?.IDENTITY_ATTACK?.summaryScore?.value || 0,
    };

    const { isFitForSubmission, warning, advice } = determineFitForSubmission(attributeScores);

    return { isFitForSubmission, warning, advice };
}

function determineFitForSubmission(attributeScores) {
    let isFitForSubmission = true;
    let warning = '';
    let advice = '';

    Object.entries(attributeScores).forEach(([attribute, score]) => {
        if (score >= getThreshold(attribute)) {
            isFitForSubmission = false;
            const { warning: newWarning, advice: newAdvice } = generateWarningAndAdvice(attributeScores);
            warning = newWarning;
            advice = newAdvice;
        }
    });

    return { isFitForSubmission, warning, advice };
}

function getThreshold(attribute) {
    switch (attribute) {
        case 'insult':
            return insultThreshold;
        case 'threat':
            return threatThreshold;
        case 'severeToxicity':
            return severeToxicityThreshold;
        case 'identityAttack':
            return identityAttackThreshold;
        default:
            return toxicityThreshold;
    }
}

function generateWarningAndAdvice(attributeScores) {
    let warning = '';
    let advice = '';

    // Customize the warning and advice based on attribute scores
    if (attributeScores.insult >= insultThreshold) {
        warning = 'Your message includes insulting language that might hurt others.';
        advice = 'Try expressing your thoughts in a kind and respectful way.';
    } else if (attributeScores.threat >= threatThreshold) {
        warning = 'Your message contains threatening language.';
        advice = 'Please consider using calm and respectful words to share your thoughts.';
    } else if (attributeScores.severeToxicity >= severeToxicityThreshold) {
        warning = 'Your message is highly toxic and could be harmful.';
        advice = 'Kindly rephrase to ensure your words promote understanding and positivity.';
    } else if (attributeScores.identityAttack >= identityAttackThreshold) {
        warning = 'Your message targets someone’s identity, which can be hurtful.';
        advice = 'Focus on being open-minded and avoid language that singles out individuals or groups.';
    } else {
        warning = 'Your message might come across as negative.';
        advice = 'Consider reviewing your words to make them more constructive and respectful.';
    }
    

    return { warning, advice };
}