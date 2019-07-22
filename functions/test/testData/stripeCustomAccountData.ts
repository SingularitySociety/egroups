export const postData = {
  "individual": {
    "address_kana":{
      "postal_code": "1690051",
      "state": "トウキョウト",
      "city": "シンジュクク",
      "town": "ニシワセダ３チョウメ",
      "line1": "4-1",
      "line2": "ホゲホゲ"
    },
    "address_kanji":{
      "postal_code": "1690051",
      "state": "東京都",
      "city": "新宿区",
      "town": "西早稲田3",
      "line1": "4-1",
      "line2": "ほげほげ"
    },
    "dob": {
      "day": 1,
      "month": 8,
      "year": 1980,
    },
    "phone": "+819012345678",
    "first_name_kana": "ニホン",
    "first_name_kanji": "日本",
    "last_name_kana": "タロウ",
    "last_name_kanji": "太郎",
    "gender":"female",
  },
  "invalid_individual": {
    "address_kana":{
      "postal_code": "1690051",
      "state": "トウキョウト",
      "city": "シンジュクク",
      "town": "ニシワセダ４チョウメ",
      "line1": "4-1",
      "line2": "ホゲホゲ"
    },
    "address_kanji":{
      "postal_code": "1690051",
      "state": "東京都",
      "city": "新宿区",
      "town": "西早稲田4",
      "line1": "4-1",
      "line2": "ほげほげ"
    },
    "dob": {
      "day": 1,
      "month": 8,
      "year": 1980,
    },
    "phone": "+819012345678",
    "first_name_kana": "名前（カナ）",
    "first_name_kanji": "名前（漢字）",
    "last_name_kana": "姓（カナ）",
    "last_name_kanji": "姓（漢字）",
    "gender":"female",
  },
  "company": {
    "name": "会社名",
    "name_kana": "ヤマダショウカイ",
    "name_kanji": "山田商会",
    "tax_id": "123123",
    "address_kana":{
      "postal_code": "1690051",
      "state": "トウキョウト",
      "city": "シンジュクク",
      "town": "ニシワセダ３チョウメ",
      "line1": "4-1",
      "line2": "ホゲホゲ"
    },
    "address_kanji":{
      "postal_code": "1690051",
      "state": "東京都",
      "city": "新宿区",
      "town": "西早稲田3",
      "line1": "4-1",
      "line2": "ほげほげ"
    },
    "personal_address_kana":{
      "postal_code": "1690051",
      "state": "トウキョウト",
      "city": "シンジュクク",
      "town": "ニシワセダ３チョウメ",
      "line1": "4-1",
      "line2": "ホゲホゲ"
    },
    "personal_address_kanji":{
      "postal_code": "1690051",
      "state": "東京都",
      "city": "新宿区",
      "town": "西早稲田3",
      "line1": "4-1",
      "line2": "ほげほげ"
    },
    "phone": "+819012345678",
  },
  "person": {
    "dob": {
      "day": 1,
      "month": 8,
      "year": 1980,
    },
    "phone": "+819012345678",
    "first_name_kana": "コジン",
    "first_name_kanji": "個人",
    "last_name_kana": "タロウ",
    "last_name_kanji": "太郎",
    "gender":"female",
  }
};


export const postDataUS = {
  "individual": {
    "address":{
      "postal_code": "98109",
      "state": "WA",
      "city": "Seattle",
      "town": "Terry Avenue North",
      "line1": "410",
    },
    "dob": {
      "day": 1,
      "month": 8,
      "year": 1980,
    },
    "phone": "+1-866-216-1072",
    "first_name": "alex",
    "last_name": "rose",
    "gender":"female",
  },
  "invalid_individual": {
    "address":{
      "postal_code": "1111112",
      "state": "WAZAA",
      "city": "Seattleaz",
      "town": "Terry Avenue North",
      "line1": "410111",
    },
    "dob": {
      "day": 1,
      "month": 8,
      "year": 1980,
    },
    "phone": "866-216-1072",
    "first_name": "alex",
    "last_name": "rose",
    "gender":"female",
  },
  // https://stripe.com/docs/api/accounts/update#update_account-company
  "business_profile": {
    "url": "https://to-kyo.to/",
    "name": "zero to one corp",
  },
  "business_profile2": {
    "url": "https://to-kyo.to/",
    "name": "hello web",
  },
  "company": {
    // "business_name": "会社名",
    // "business_name_kana": "会社名（カナ）",
    // "business_name_kanji": "会社名（漢字）",
    // "business_tax_id": "会社法人等番号",
    "name": "zero to one corp",
    "address":{
      "postal_code": "98109",
      "state": "WA",
      "city": "Seattle",
      "town": "Terry Avenue North",
      "line1": "410",
    },
    "personal_address":{
      "postal_code": "98109",
      "state": "WA",
      "city": "Seattle",
      "town": "Terry Avenue North",
      "line1": "410",
    },
    "phone": "541-754-3010",
    "tax_id": "123123123123",
  }
};

export const bank_jp = {
  object: "bank_account",
  country: "jp",
  currency: "jpy",
  account_holder_name: "ヤマダハナコ",
  account_holder_type: "individual",
  routing_number: "1100000", // bank code and branch code
  account_number: "00012345",
};


export const bank_us = {
  object: "bank_account",
  country: "us",
  currency: "usd",
  account_holder_name: "axel rose",
  account_holder_type: "individual",
  routing_number: "111000000", // bank code and branch code
  account_number: "000123456789",
};
