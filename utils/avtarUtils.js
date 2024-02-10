const getRandomOption = (options) => {
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  };

  const getRandomColor = () => {
    const colors = [
      'black',
      'blue01',
      'blue02',
      'blue03',
      'gray01',
      'gray02',
      'heather',
      'pastelBlue',
      'pastelGreen',
      'pastelOrange',
      'pastelRed',
      'pastelYellow',
      'pink',
      'red',
      'white',
    ];
    return getRandomOption(colors);
  };

  const optionsForMale = [
    'ShortHairShortWaved',
    'ShortHairShortCurly',
    'ShortHairShaggyMullet',
  ];
  const optionsForFemale = [
    'LongHairMiaWallace',
    'LongHairBigHair',
    'LongHairBob',
    'LongHairCurly',
    'LongHairCurvy',
    'LongHairNotTooLong',
    'LongHairStraight',
    'LongHairStraight2',
    'LongHairStraightStrand',
  ];

const getRandomAvatarProperties = (gender = 'male') => {
    const options = gender === 'male' ? optionsForMale : optionsForFemale;
    return {
        background: getRandomColor(),
        svgBackground: getRandomColor(),
        skin: 'light',
        topType: getRandomOption(options),
        accessoriesType: getRandomOption([
            'Wayfarers',
            'Blank',
            'Kurt',
            'Prescription01',
            'Prescription02',
            'Round',
            'Sunglasses',
        ]),
        hairColor: getRandomOption([
            'BrownDark',
            'Brown',
            'BlondeGolden',
            'Blonde',
            'Black',
            'Auburn',
        ]),
        clotheType: getRandomOption([
            'Hoodie',
            'BlazerShirt',
            'BlazerSweater',
            'CollarSweater',
            'GraphicShirt',
            'ShirtCrewNeck',
            'ShirtVNeck',
            'ShirtScoopNeck',
        ]),
        clotheColor: getRandomOption([
            'Black',
            'Blue01',
            'Blue02',
            'Blue03',
            'Gray01',
            'Gray02',
            'Heather',
            'PastelBlue',
            'PastelGreen',
            'PastelRed',
            'PastelOrange',
            'PastelYellow',
            'Pink',
            'Red',
            'White',
        ]),
        eyeType: getRandomOption([
            'Close',
            'Default',
            'Dizzy',
            'EyeRoll',
            'Happy',
            'Side',
            'Wink',
            'WinkWacky',
        ]),
        eyebrowType: getRandomOption([
            'Angry',
            'AngryNatural',
            'Default',
            'DefaultNatural',
            'FlatNatural',
            'RaisedExcited',
            'RaisedExcitedNatural',
            'SadConcerned',
            'SadConcernedNatural',
        ]),
        mouthType: getRandomOption([
            'Smile',
            'Twinkle',
            'Tongue',
            'Serious',
            'Disbelief',
            'Default',
            'ScreamOpen',
        ]),
    };
};

export const getRandomCommentAvatar = (commentId, gender) => {
    const avatarProperties = getRandomAvatarProperties(gender);
    return { ...avatarProperties, key: `avatar_${commentId}_${Date.now()}` };
};

