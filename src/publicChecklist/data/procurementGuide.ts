import procurementGuideHtml from '../../../procurement_guide.html?raw';

export interface ProcurementGuideOpinion {
  src: string;
  no: number;
  date: string;
  subject: string;
  opinion: string;
  stages: string[];
  references: string[];
}

export interface ProcurementGuideDecision {
  no: string;
  app: string;
  resp: string;
  subject: string;
  type: string;
  act: string;
  rule: string;
  use: string;
  decision: string;
  stages: string[];
}

interface ProcurementGuideData {
  ops: Omit<ProcurementGuideOpinion, 'stages'>[];
  pp: Omit<ProcurementGuideDecision, 'stages'>[];
}

const GUIDE_STAGES = [
  { id: 'plan', keywords: ['खरिद योजना', 'गुरुयोजना', 'बहुवर्षीय', 'खरिद इकाई', 'बजेट', 'कार्यक्रम स्वीकृत', 'खरिद विधि छनोट', 'खरिद विधि'] },
  { id: 'est', keywords: ['लागत अनुमान', 'दररेट', 'दर विश्लेषण', 'नर्म्स', 'भ्याट', 'लागत अनुमानभन्दा', 'स्वीकृत लागत'] },
  { id: 'doc', keywords: ['बोलपत्र कागजात', 'स्पेसिफिकेसन', 'ब्रान्ड', 'योग्यताको आधार', 'पूर्वयोग्यता', 'पूर्व योग्यता', 'नमुना', 'मूल्य सूची', 'बोलपत्र सम्बन्धी कागजात', 'प्राविधिक विशिष्टता'] },
  { id: 'call', keywords: ['सूचना प्रकाशन', 'आव्हान', 'आह्वान', 'पुन: आव्हान', 'पुनः आव्हान', 'दोस्रो पटक', 'तेस्रो पटक', 'सूचना अवधि', 'म्याद', 'राष्ट्रिय स्तरको पत्रिका', 'अन्तर्राष्ट्रिय बोलपत्र'] },
  { id: 'sub', keywords: ['दाखिला', 'खामबन्दी', 'सिलबन्दी', 'बोलपत्र जमानत', 'बिड बण्ड', 'जमानत', 'ई-बिडिङ', 'e-bid', 'इ-बिडिङ', 'submission', 'खोल्ने', 'खोल्दा', 'अन्तिम मिति', 'बोलपत्र खोली'] },
  { id: 'eval', keywords: ['परीक्षण', 'मूल्याङ्कन', 'मूल्यांकन', 'सारभूत', 'प्रभावग्राही', 'न्यूनतम मूल्याङ्कित', 'अङ्कगणितीय', 'अयोग्य', 'अनुभव', 'कारोबार', 'टर्न', 'टर्नओभर', 'संयुक्त उपक्रम', 'जे.भी', 'कर चुक्ता', 'सानातिना', 'त्रुटि', 'अख्तियारी', 'भ्याट दर्ता'] },
  { id: 'intent', keywords: ['आशयको सूचना', 'स्वीकृत', 'स्वीकृति', 'पुनरावलोकन', 'निवेदन', 'स्थगन', 'सात दिन', '७ दिन', 'सम्झौता गर्न आउन', 'अस्वीकृत', 'रद्द', 'बदर'] },
  { id: 'con', keywords: ['सम्झौता', 'कार्य सम्पादन जमानत', 'कार्यसम्पादन', 'म्याद थप', 'मूल्य समायोजन', 'भेरियसन', 'ठेक्का', 'क्षतिपूर्ति', 'पेस्की', 'भुक्तानी', 'धरौटी', 'हर्जाना', 'अन्तिम भुक्तानी', 'ठेक्का तोड', 'कालोसूची', 'कालो सूची'] },
  { id: 'spec', keywords: ['सोझै', 'प्रोप्राइटरी', 'उपभोक्ता समिति', 'सिलबन्दी दरभाउपत्र', 'दरभाउपत्र', 'लिज', 'एकल स्रोत', 'आकस्मिक', 'स्वदेशी उत्पादन', 'सशस्त्र', 'रासन', 'साझेदारी', 'प्रत्यक्ष', 'गैरसरकारी', 'वस्तु विनिमय', 'लिलाम', 'उपभोक्ता'] },
  { id: 'cons', keywords: ['परामर्श सेवा', 'परामर्शदाता', 'आशयपत्र', 'सङ्क्षिप्त सूची', 'संक्षिप्त सूची', 'प्रस्ताव', 'RFP', 'SRFP', 'प्राविधिक प्रस्ताव', 'आर्थिक प्रस्ताव', 'गुणस्तर', 'कन्सल्टेन्ट', 'consult', 'प्रस्तावदाता', 'वार्ता'] },
];

const parseGuideData = (): ProcurementGuideData => {
  const dataStart = procurementGuideHtml.indexOf('<script id="data"');
  const jsonStart = procurementGuideHtml.indexOf('>', dataStart) + 1;
  const jsonEnd = procurementGuideHtml.indexOf('</script>', jsonStart);

  if (dataStart < 0 || jsonStart <= 0 || jsonEnd < 0) {
    throw new Error('procurement_guide.html मा राय/निर्णय data भेटिएन।');
  }

  return JSON.parse(procurementGuideHtml.slice(jsonStart, jsonEnd)) as ProcurementGuideData;
};

const classifyStages = (subject: string, text: string): string[] => {
  const scores = GUIDE_STAGES.map(({ id, keywords }) => {
    const score = keywords.reduce((total, keyword) => {
      const subjectScore = subject.includes(keyword) ? 3 : 0;
      const textScore = Math.min(text.split(keyword).length - 1, 3);
      return total + subjectScore + textScore;
    }, 0);
    return { id, score };
  });

  return scores
    .sort((left, right) => right.score - left.score)
    .filter(({ score }) => score >= 3)
    .slice(0, 2)
    .map(({ id }) => id);
};

const extractReferences = (text: string): string[] => Array.from(
  new Set(Array.from(text.matchAll(/(दफा|नियम)\s*([०-९]{1,3})/g), (match) => `${match[1]} ${match[2]}`))
);

const guideData = parseGuideData();

export const PROCUREMENT_GUIDE_OPINIONS: ProcurementGuideOpinion[] = guideData.ops.map((item) => ({
  ...item,
  stages: classifyStages(item.subject, `${item.subject} ${item.opinion}`),
  references: extractReferences(`${item.subject} ${item.opinion}`),
}));

export const PROCUREMENT_GUIDE_DECISIONS: ProcurementGuideDecision[] = guideData.pp.map((item) => ({
  ...item,
  stages: classifyStages(item.subject, [item.subject, item.decision, item.act, item.rule].join(' ')),
}));

export const PROCUREMENT_GUIDE_STAGE_IDS = GUIDE_STAGES.map(({ id }) => id);