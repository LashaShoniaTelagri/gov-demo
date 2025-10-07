// Region and Municipality translations
export const regionTranslations: Record<string, string> = {
  'Kakheti': 'კახეთი',
  'Kvemo Kartli': 'ქვემო ქართლი',
  'Shida Kartli': 'შიდა ქართლი',
  'Samtskhe-Javakheti': 'სამცხე-ჯავახეთი',
  'Imereti': 'იმერეთი',
  'Guria': 'გურია',
  'Samegrelo': 'სამეგრელო',
  'Racha': 'რაჭა',
  'Racha-Lechkhumi': 'რაჭა-ლეჩხუმი',
  'Adjara': 'აჭარა',
  'Mtskheta-Mtianeti': 'მცხეთა-მთიანეთი',
};

export const municipalityTranslations: Record<string, string> = {
  // Kakheti
  'Telavi': 'თელავი',
  'Gurjaani': 'გურჯაანი',
  'Sighnaghi': 'სიღნაღი',
  'Dedoplistskaro': 'დედოფლისწყარო',
  'Sagarejo': 'საგარეჯო',
  'Kvareli': 'ყვარელი',
  'Lagodekhi': 'ლაგოდეხი',
  'Akhmeta': 'ახმეტა',
  
  // Kvemo Kartli
  'Rustavi': 'რუსთავი',
  'Gardabani': 'გარდაბანი',
  'Marneuli': 'მარნეული',
  'Bolnisi': 'ბოლნისი',
  'Dmanisi': 'დმანისი',
  'Tsalka': 'წალკა',
  'Tetritskaro': 'თეთრიწყარო',
  
  // Shida Kartli
  'Gori': 'გორი',
  'Kaspi': 'კასპი',
  'Kareli': 'ქარელი',
  'Khashuri': 'ხაშური',
  
  // Samtskhe-Javakheti
  'Akhaltsikhe': 'ახალციხე',
  'Adigeni': 'ადიგენი',
  'Aspindza': 'ასპინძა',
  'Akhalkalaki': 'ახალქალაქი',
  'Ninotsminda': 'ნინოწმინდა',
  'Borjomi': 'ბორჯომი',
  
  // Imereti
  'Kutaisi': 'ქუთაისი',
  'Baghdati': 'ბაღდათი',
  'Vani': 'ვანი',
  'Zestaponi': 'ზესტაფონი',
  'Terjola': 'თერჯოლა',
  'Samtredia': 'სამტრედია',
  'Sachkhere': 'საჩხერე',
  'Tkibuli': 'ტყიბული',
  'Chiatura': 'ჭიათურა',
  'Kharagauli': 'ხარაგაული',
  'Khoni': 'ხონი',
  'Tskaltubo': 'წყალტუბო',
  
  // Samegrelo
  'Zugdidi': 'ზუგდიდი',
  'Mestia': 'მესტია',
  'Chkhorotskhu': 'ჩხოროწყუ',
  'Martvili': 'მარტვილი',
  'Abasha': 'აბაშა',
  'Senaki': 'სენაკი',
  'Poti': 'ფოთი',
  'Khobi': 'ხობი',
  'Tsalenjikha': 'წალენჯიხა',
  
  // Guria
  'Ozurgeti': 'ოზურგეთი',
  'Lanchkhuti': 'ლანჩხუთი',
  'Chokhatauri': 'ჩოხატაური',
  
  // Adjara
  'Batumi': 'ბათუმი',
  'Kobuleti': 'ქობულეთი',
  'Khelvachauri': 'ხელვაჩაური',
  'Shuakhevi': 'შუახევი',
  'Khulo': 'ხულო',
  'Keda': 'ქედა',
  
  // Mtskheta-Mtianeti
  'Mtskheta': 'მცხეთა',
  'Dusheti': 'დუშეთი',
  'Tianeti': 'თიანეთი',
  'Kazbegi': 'ყაზბეგი',

  'Ambrolauri': 'ამბროლაური',
};

export const translateRegion = (region: string, language: string): string => {
  if (language === 'ka' && regionTranslations[region]) {
    return regionTranslations[region];
  }
  return region;
};

export const translateMunicipality = (municipality: string, language: string): string => {
  if (language === 'ka' && municipalityTranslations[municipality]) {
    return municipalityTranslations[municipality];
  }
  return municipality;
};
