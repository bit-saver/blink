import fs from 'fs';
import plist from 'plist';

const files = fs.readdirSync('./').filter((f) => f.endsWith('.itermcolors'));

console.log(files);

async function convert(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const xml = await plist.parse(raw);
  /**
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
  const rgb = (data) => `rgba(${data['Red Component']*255},${data['Green Component']*255},${data['Blue Component']*255},${data['Alpha Component']})`;
  const colors = [];
  for (let i = 1; i <= 15; i++) {
    colors.push(rgb(xml[`Ansi ${i} Color`]));
  }
  const lines = [];
  lines.push(`t.prefs_.set('color-palette-overrides', ['${colors.join("','")}']);`);
  lines.push(`t.prefs_.set('cursor-color', '${rgb(xml['Cursor Color'])}');`);
  lines.push(`t.prefs_.set('foreground-color', '${rgb(xml['Foreground Color'])}');`);
  lines.push(`t.prefs_.set('background-color', '${rgb(xml['Background Color'])}');`);
  fs.writeFileSync(file.replace('.itermcolors', '.js'), lines.join('\n'));
}

files.map(convert);
