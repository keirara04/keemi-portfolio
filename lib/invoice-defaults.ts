export type HakeemiDefaults = {
  businessName: string;
  email: string;
  phone: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
};

export type EzzyDefaults = {
  businessName: string;
  email: string;
  phone: string;
  paymentInfo: string;
};

export function getHakeemiDefaults(): HakeemiDefaults {
  return {
    businessName: process.env.HAKEEMI_BUSINESS_NAME ?? "",
    email: process.env.HAKEEMI_EMAIL ?? "",
    phone: process.env.HAKEEMI_PHONE ?? "",
    bankName: process.env.HAKEEMI_BANK_NAME ?? "",
    bankAccount: process.env.HAKEEMI_BANK_ACCOUNT ?? "",
    bankHolder: process.env.HAKEEMI_BANK_HOLDER ?? "",
  };
}

export function getEzzyDefaults(): EzzyDefaults {
  return {
    businessName: process.env.EZZY_BUSINESS_NAME ?? "",
    email: process.env.EZZY_EMAIL ?? "",
    phone: process.env.EZZY_PHONE ?? "",
    paymentInfo: process.env.EZZY_PAYMENT_INFO ?? "",
  };
}
