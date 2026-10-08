import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
for(const mode of ['desktop','touch','blocked']){
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 if(mode==='blocked')await page.addInitScript(()=>{HTMLCanvasElement.prototype.requestPointerLock=()=>Promise.reject(new DOMException('Blocked','SecurityError'));});
 await page.goto((process.env.TEST_URL||'http://127.0.0.1:8772/')+(mode==='touch'?'?touch':''));
 await page.waitForFunction(()=>window.__game);
 assert.equal(await page.locator('a[href*="github.com"],a[href*="x.com"]').count(),0);
 await page.locator('#btnStart').click();
 await page.waitForTimeout(700);
 await page.mouse.move(600,400);await page.mouse.click(600,400);
 await page.waitForTimeout(200);
 const before=await page.evaluate(()=>({yaw:__game.player.yaw,shots:__game.player.stats.shots}));
 await page.mouse.move(650,420,{steps:5});await page.mouse.down();await page.waitForTimeout(400);await page.mouse.up();
 const after=await page.evaluate(()=>({yaw:__game.player.yaw,shots:__game.player.stats.shots,fire:__game.player.mouse.l}));
 assert.notEqual(after.yaw,before.yaw,mode+' look');assert.ok(after.shots>before.shots,mode+' fire');assert.equal(after.fire,false);
 console.log('PASS',mode,'mouse look / fire / release / no social links');await page.close();
}
}finally{await browser.close();}
