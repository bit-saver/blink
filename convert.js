import fs from 'fs';
import plist from 'plist';

function componentToHex(c) {
  const hex = c.toString(16)
  return hex.length === 1 ? `0${hex}` : hex
}

const files = fs.readdirSync('./').filter((f) => f.endsWith('.itermcolors'));

async function convert(file) {
  const jsFile = file.replace('.itermcolors', '.js');
  if (fs.existsSync(jsFile)) {
    console.log(`File exists: ${jsFile}`);
    return;
  }
  const raw = fs.readFileSync(file, 'utf8');
  const xml = await plist.parse(raw);
  /**
   *   {{ Ansi_0_Color }} // black
   *   {{ Ansi_1_Color }} // red
   *   {{ Ansi_2_Color }} // green
   *   {{ Ansi_3_Color }} // yellow
   *   {{ Ansi_4_Color }} // blue
   *   {{ Ansi_5_Color }} // magenta
   *   {{ Ansi_6_Color }} // cyan
   *   {{ Ansi_7_Color }} // white
   *   {{ Ansi_8_Color }} // bright black
   *   {{ Ansi_9_Color }} // bright red
   *   {{ Ansi_10_Color }} // bright green
   *   {{ Ansi_11_Color }} // bright yellow
   *   {{ Ansi_12_Color }} // bright blue
   *   {{ Ansi_13_Color }} // bright magenta
   *   {{ Ansi_14_Color }} // bright cyan
   *   {{ Ansi_15_Color }} // bright white
   *
   * t.prefs_.set('color-palette-overrides',
   *                  [ black , red     , green  , yellow,
   *                   blue     , magenta , cyan   , white,
   *                   lightBlack   , lightRed  , lightGreen , lightYellow,
   *                   lightBlue    , lightMagenta  , lightCyan  , lightWhite ]);
   *
   * t.prefs_.set('cursor-color', 'rgba(0, 0, 0, 0.5)');
   * t.prefs_.set('foreground-color', '#000000');
   * t.prefs_.set('background-color', white);
   */
  const comp = (data, color) => componentToHex(Math.round(data[`${color} Component`] * 255))
  const rgb = (data) => `#${comp(data, 'Red')}${comp(data, 'Green')}${comp(data, 'Blue')}`;
  const colors = [];
  for (let i = 1; i <= 15; i++) {
    colors.push(rgb(xml[`Ansi ${i} Color`]));
  }
  const lines = [];
  lines.push(`t.prefs_.set('color-palette-overrides', ['${colors.join("','")}']);`);
  lines.push(`t.prefs_.set('cursor-color', '${rgb(xml['Cursor Color'])}');`);
  lines.push(`t.prefs_.set('foreground-color', '${rgb(xml['Foreground Color'])}');`);
  lines.push(`t.prefs_.set('background-color', '${rgb(xml['Background Color'])}');`);
  fs.writeFileSync(jsFile, lines.join('\n'));
  console.log(`Converted: ${jsFile}`);
}

files.map(convert);
