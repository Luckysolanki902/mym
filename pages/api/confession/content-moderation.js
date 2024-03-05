const toxicityThreshold = 0.7;
const severeToxicityThreshold = 0.6;
const identityAttackThreshold = 0.6;
const insultThreshold = 0.6;
const threatThreshold = 0.6;

export default async function handler(req, res) {
    const { confessionContent } = req.body;

    if (!confessionContent) {
        return res.status(400).json({ error: 'Missing confession content' });
    }

    const sentences = confessionContent.split(/[.,!?\n]+/);

    const problematicSentences = [];
    let isFitForSubmission = true;
    let warning = '';
    let advice = ''; 

    for (const sentence of sentences) {
        const result = await analyzeSentence(sentence);

        if (!result.isFitForSubmission) {
            isFitForSubmission = false;
            problematicSentences.push(sentence);
            warning = result.warning;
            advice = result.advice;
        }
    }
    res.status(200).json({ isFitForSubmission, problematicSentences, warning, advice });
}

async function analyzeSentence(sentence) {
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
    if (data.error) {
        console.error('Error analyzing sentence:', data.error.message);
        return { isFitForSubmission: true, warning: '' };
    }
    const attributeScores = {
        insult: data.attributeScores.INSULT.summaryScore.value,
        threat: data.attributeScores.THREAT.summaryScore.value,
        severeToxicity: data.attributeScores.SEVERE_TOXICITY.summaryScore.value,
        identityAttack: data.attributeScores.IDENTITY_ATTACK.summaryScore.value,
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
        warning = 'Your confession contains insulting language, which may harm others.';
        advice = 'Kindly express your thoughts with empathy and choose words that foster a positive dialogue.';
    } else if (attributeScores.threat >= threatThreshold) {
        warning = 'Your confession contains threats, which is not conducive to a healthy conversation.';
        advice = 'Please reconsider your words and communicate in a non-threatening and respectful manner.';
    } else if (attributeScores.severeToxicity >= severeToxicityThreshold) {
        warning = 'Your confession has a high level of severe toxicity, indicating harmful language.';
        advice = 'It is crucial to communicate respectfully. Consider rephrasing to promote positive and constructive dialogue.';
    } else {
        if (attributeScores.identityAttack >= identityAttackThreshold) {
            warning = 'Your confession contains identity attacks, targeting a specific person or group.';
            advice = 'Encourage open-mindedness and avoid using language that attacks someone based on their identity.';
        } else {
            warning = 'Your confession might have elements that could be perceived negatively.';
            advice = 'Take a moment to review your words, ensuring they contribute to a respectful and constructive conversation.';
        }
    }

    return {warning, advice};
}
