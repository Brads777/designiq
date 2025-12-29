/**
 * IDML Generation Service for DesignIQ
 * Generates InDesign Markup Language files for professional publishing workflows
 * 
 * IDML Structure:
 * - mimetype (uncompressed)
 * - designmap.xml (master document)
 * - META-INF/container.xml
 * - Resources/
 *   - Fonts.xml
 *   - Graphic.xml
 *   - Preferences.xml
 *   - Styles.xml
 * - MasterSpreads/
 * - Spreads/
 * - Stories/
 * - XML/
 */

import { BookTheme, TrimSize } from "./pdfGenerator";

export interface IDMLGenerationOptions {
  theme: BookTheme;
  trimSize: TrimSize;
  documentTitle: string;
}

/**
 * Generate the basic IDML structure
 * This creates the XML files needed for a valid IDML package
 */
export function generateIDMLStructure(
  chapters: Array<{
    number: number;
    title: string;
    content: string;
  }>,
  options: IDMLGenerationOptions
): Map<string, string> {
  const files = new Map<string, string>();
  
  // mimetype file (must be first and uncompressed)
  files.set("mimetype", "application/vnd.adobe.indesign-idml-package");
  
  // META-INF/container.xml
  files.set("META-INF/container.xml", generateContainerXml());
  
  // designmap.xml
  files.set("designmap.xml", generateDesignmapXml(chapters.length));
  
  // Resources
  files.set("Resources/Fonts.xml", generateFontsXml(options.theme));
  files.set("Resources/Styles.xml", generateStylesXml(options.theme));
  files.set("Resources/Preferences.xml", generatePreferencesXml(options.trimSize));
  files.set("Resources/Graphic.xml", generateGraphicXml());
  
  // Master Spreads
  files.set("MasterSpreads/MasterSpread_udd.xml", generateMasterSpreadXml(options.trimSize));
  
  // Stories (content)
  chapters.forEach((chapter, index) => {
    files.set(`Stories/Story_u${100 + index}.xml`, generateStoryXml(chapter, options.theme));
  });
  
  // Spreads
  const spreadCount = Math.ceil(chapters.length * 10); // Estimate spreads
  for (let i = 0; i < spreadCount; i++) {
    files.set(`Spreads/Spread_u${200 + i}.xml`, generateSpreadXml(i, options.trimSize));
  }
  
  return files;
}

function generateContainerXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
  <rootfiles>
    <rootfile full-path="designmap.xml" media-type="text/xml"/>
  </rootfiles>
</container>`;
}

function generateDesignmapXml(chapterCount: number): string {
  const storyRefs = Array.from({ length: chapterCount }, (_, i) => 
    `<idPkg:Story src="Stories/Story_u${100 + i}.xml"/>`
  ).join("\n    ");
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Document xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="18.0">
  <idPkg:Fonts src="Resources/Fonts.xml"/>
  <idPkg:Styles src="Resources/Styles.xml"/>
  <idPkg:Preferences src="Resources/Preferences.xml"/>
  <idPkg:Graphic src="Resources/Graphic.xml"/>
  <idPkg:MasterSpread src="MasterSpreads/MasterSpread_udd.xml"/>
  ${storyRefs}
</Document>`;
}

function generateFontsXml(theme: BookTheme): string {
  // Extract font family name
  const fontFamily = theme.fontFamily.split(",")[0].replace(/['"]/g, "").trim();
  const titleFontFamily = theme.titleFontFamily.split(",")[0].replace(/['"]/g, "").trim();
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Fonts xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="18.0">
  <FontFamily Self="FontFamily/${fontFamily}" Name="${fontFamily}">
    <Font Self="Font/${fontFamily}" FontFamily="${fontFamily}" Name="Regular" FontStyleName="Regular" FontType="OpenTypeCFF"/>
    <Font Self="Font/${fontFamily}$Bold" FontFamily="${fontFamily}" Name="Bold" FontStyleName="Bold" FontType="OpenTypeCFF"/>
    <Font Self="Font/${fontFamily}$Italic" FontFamily="${fontFamily}" Name="Italic" FontStyleName="Italic" FontType="OpenTypeCFF"/>
  </FontFamily>
  ${fontFamily !== titleFontFamily ? `
  <FontFamily Self="FontFamily/${titleFontFamily}" Name="${titleFontFamily}">
    <Font Self="Font/${titleFontFamily}" FontFamily="${titleFontFamily}" Name="Regular" FontStyleName="Regular" FontType="OpenTypeCFF"/>
  </FontFamily>` : ''}
</idPkg:Fonts>`;
}

function generateStylesXml(theme: BookTheme): string {
  const fontFamily = theme.fontFamily.split(",")[0].replace(/['"]/g, "").trim();
  const titleFontFamily = theme.titleFontFamily.split(",")[0].replace(/['"]/g, "").trim();
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Styles xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="18.0">
  <RootParagraphStyleGroup Self="RootParagraphStyleGroup">
    <ParagraphStyle Self="ParagraphStyle/[No paragraph style]" Name="[No paragraph style]"/>
    <ParagraphStyle Self="ParagraphStyle/[Basic Paragraph]" Name="[Basic Paragraph]" 
      AppliedFont="Font/${fontFamily}" 
      PointSize="${theme.fontSize}"
      AutoLeading="${theme.lineHeight * 100}"
      Justification="LeftJustified"
      FirstLineIndent="18"/>
    <ParagraphStyle Self="ParagraphStyle/Body Text" Name="Body Text" 
      BasedOn="ParagraphStyle/[Basic Paragraph]"
      AppliedFont="Font/${fontFamily}" 
      PointSize="${theme.fontSize}"
      AutoLeading="${theme.lineHeight * 100}"
      Justification="LeftJustified"
      FirstLineIndent="18"
      Hyphenation="true"/>
    <ParagraphStyle Self="ParagraphStyle/First Paragraph" Name="First Paragraph" 
      BasedOn="ParagraphStyle/Body Text"
      FirstLineIndent="0"
      ${theme.chapterStyle.dropCap ? `DropCapCharacters="1" DropCapLines="${theme.chapterStyle.dropCapLines}"` : ''}/>
    <ParagraphStyle Self="ParagraphStyle/Chapter Title" Name="Chapter Title" 
      AppliedFont="Font/${titleFontFamily}" 
      PointSize="${theme.fontSize * 2}"
      Justification="${theme.chapterStyle.titleAlignment === 'center' ? 'CenterAlign' : theme.chapterStyle.titleAlignment === 'right' ? 'RightAlign' : 'LeftAlign'}"
      SpaceBefore="144"
      SpaceAfter="36"
      KeepWithNext="1"/>
    <ParagraphStyle Self="ParagraphStyle/Chapter Number" Name="Chapter Number" 
      AppliedFont="Font/${titleFontFamily}" 
      PointSize="${theme.fontSize}"
      Justification="${theme.chapterStyle.titleAlignment === 'center' ? 'CenterAlign' : theme.chapterStyle.titleAlignment === 'right' ? 'RightAlign' : 'LeftAlign'}"
      Capitalization="AllCaps"
      Tracking="200"
      SpaceAfter="18"/>
    <ParagraphStyle Self="ParagraphStyle/Block Quote" Name="Block Quote" 
      BasedOn="ParagraphStyle/Body Text"
      LeftIndent="36"
      RightIndent="36"
      FontStyle="Italic"/>
  </RootParagraphStyleGroup>
  <RootCharacterStyleGroup Self="RootCharacterStyleGroup">
    <CharacterStyle Self="CharacterStyle/[No character style]" Name="[No character style]"/>
    <CharacterStyle Self="CharacterStyle/Bold" Name="Bold" FontStyle="Bold"/>
    <CharacterStyle Self="CharacterStyle/Italic" Name="Italic" FontStyle="Italic"/>
    <CharacterStyle Self="CharacterStyle/Bold Italic" Name="Bold Italic" FontStyle="Bold Italic"/>
  </RootCharacterStyleGroup>
</idPkg:Styles>`;
}

function generatePreferencesXml(trimSize: TrimSize): string {
  // Convert inches to points (72 points per inch)
  const pageWidth = trimSize.width * 72;
  const pageHeight = trimSize.height * 72;
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Preferences xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="18.0">
  <DocumentPreference PageWidth="${pageWidth}" PageHeight="${pageHeight}" 
    FacingPages="true" 
    PageBinding="LeftToRight"
    ColumnGuideColor="Enumeration/Violet"
    MarginGuideColor="Enumeration/Magenta"/>
  <TextDefault AppliedParagraphStyle="ParagraphStyle/Body Text"/>
  <StoryPreference OpticalMarginAlignment="true" OpticalMarginSize="12"/>
</idPkg:Preferences>`;
}

function generateGraphicXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Graphic xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="18.0">
  <Color Self="Color/Black" Model="Process" Space="CMYK" ColorValue="0 0 0 100"/>
  <Color Self="Color/Paper" Model="Process" Space="CMYK" ColorValue="0 0 0 0"/>
  <Swatch Self="Swatch/None" Name="None" ColorType="Spot"/>
</idPkg:Graphic>`;
}

function generateMasterSpreadXml(trimSize: TrimSize): string {
  const pageWidth = trimSize.width * 72;
  const pageHeight = trimSize.height * 72;
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:MasterSpread xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="18.0">
  <MasterSpread Self="udd" Name="A-Master" NamePrefix="A" BaseName="Master" 
    PageCount="2" ItemTransform="1 0 0 1 0 0">
    <Page Self="udd1" Name="A" AppliedMaster="n" 
      GeometricBounds="0 0 ${pageHeight} ${pageWidth}"
      ItemTransform="1 0 0 1 0 0">
      <MarginPreference ColumnCount="1" ColumnGutter="12" 
        Top="54" Left="63" Bottom="54" Right="45"/>
    </Page>
    <Page Self="udd2" Name="A" AppliedMaster="n" 
      GeometricBounds="0 ${pageWidth} ${pageHeight} ${pageWidth * 2}"
      ItemTransform="1 0 0 1 ${pageWidth} 0">
      <MarginPreference ColumnCount="1" ColumnGutter="12" 
        Top="54" Left="45" Bottom="54" Right="63"/>
    </Page>
  </MasterSpread>
</idPkg:MasterSpread>`;
}

function generateStoryXml(
  chapter: { number: number; title: string; content: string },
  theme: BookTheme
): string {
  // Convert HTML content to IDML story format
  const content = htmlToIdmlContent(chapter.content);
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Story xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="18.0">
  <Story Self="u${100 + chapter.number}" AppliedTOCStyle="n" TrackChanges="false" StoryTitle="${escapeXml(chapter.title)}">
    <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/Chapter Number">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/[No character style]">
        <Content>CHAPTER ${chapter.number}</Content>
      </CharacterStyleRange>
      <Br/>
    </ParagraphStyleRange>
    <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/Chapter Title">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/[No character style]">
        <Content>${escapeXml(chapter.title)}</Content>
      </CharacterStyleRange>
      <Br/>
    </ParagraphStyleRange>
    ${content}
  </Story>
</idPkg:Story>`;
}

function generateSpreadXml(spreadIndex: number, trimSize: TrimSize): string {
  const pageWidth = trimSize.width * 72;
  const pageHeight = trimSize.height * 72;
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Spread xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="18.0">
  <Spread Self="u${200 + spreadIndex}" PageCount="2" 
    BindingLocation="${spreadIndex === 0 ? '0' : '1'}" 
    AllowPageShuffle="true"
    ItemTransform="1 0 0 1 0 0"
    FlattenerOverride="Default">
    <Page Self="u${200 + spreadIndex}p1" AppliedMaster="udd" 
      GeometricBounds="0 0 ${pageHeight} ${pageWidth}"
      ItemTransform="1 0 0 1 0 0"/>
    <Page Self="u${200 + spreadIndex}p2" AppliedMaster="udd" 
      GeometricBounds="0 ${pageWidth} ${pageHeight} ${pageWidth * 2}"
      ItemTransform="1 0 0 1 ${pageWidth} 0"/>
  </Spread>
</idPkg:Spread>`;
}

/**
 * Convert HTML content to IDML story content
 */
function htmlToIdmlContent(html: string): string {
  let result = '';
  let isFirstParagraph = true;
  
  // Simple HTML to IDML conversion
  // Split by paragraph tags
  const paragraphs = html.split(/<\/p>/i);
  
  for (const para of paragraphs) {
    const cleanPara = para.replace(/<p[^>]*>/gi, '').trim();
    if (!cleanPara) continue;
    
    const style = isFirstParagraph ? 'First Paragraph' : 'Body Text';
    isFirstParagraph = false;
    
    // Handle inline formatting
    let content = cleanPara
      .replace(/<strong>|<b>/gi, '</CharacterStyleRange><CharacterStyleRange AppliedCharacterStyle="CharacterStyle/Bold">')
      .replace(/<\/strong>|<\/b>/gi, '</CharacterStyleRange><CharacterStyleRange AppliedCharacterStyle="CharacterStyle/[No character style]">')
      .replace(/<em>|<i>/gi, '</CharacterStyleRange><CharacterStyleRange AppliedCharacterStyle="CharacterStyle/Italic">')
      .replace(/<\/em>|<\/i>/gi, '</CharacterStyleRange><CharacterStyleRange AppliedCharacterStyle="CharacterStyle/[No character style]">')
      .replace(/<[^>]+>/g, ''); // Remove remaining HTML tags
    
    content = escapeXml(content);
    
    result += `
    <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/${style}">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/[No character style]">
        <Content>${content}</Content>
      </CharacterStyleRange>
      <Br/>
    </ParagraphStyleRange>`;
  }
  
  return result;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
