// Pointer capture keeps aiming, movement and two independent fire buttons reliable.
export class TouchControls {
  constructor(game) {
    this.g = game;
    this.enabled = matchMedia('(pointer:coarse)').matches || new URLSearchParams(location.search).has('touch');
    this.fires = new Set(); this.contacts = new Map();
    if (!this.enabled) return;
    document.body.classList.add('touch-mode');
    const root = this.root = document.getElementById('touch');
    const pad = this.pad = document.createElement('div'); pad.className = 'move-pad';
    const knob = this.knob = document.createElement('i'); pad.append(knob); root.append(pad);
    const active = () => game.playing && !game.paused && !game.ended && !game.inLoadout && !root.classList.contains('hidden');
    const bind = (el, down, move, up) => {
      el.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse' && el === document.getElementById('c')) return;
        if (!active()) return;
        e.preventDefault(); e.stopPropagation(); el.setPointerCapture(e.pointerId);
        down(e);
      });
      el.addEventListener('pointermove', e => { if (active()) move?.(e); });
      for (const type of ['pointerup','pointercancel','lostpointercapture']) el.addEventListener(type, e => up?.(e));
    };
    const button = (label, cls, fn, release) => {
      const b = document.createElement('button'); b.type='button'; b.className=`touch-btn ${cls}`;
      b.textContent=label; b.setAttribute('aria-label',label); root.append(b);
      bind(b, fn, null, release); return b;
    };
    const fireDown = e => { this.fires.add(e.pointerId); const p=game.player; if(p){p.touch.fire=true;p.touch.firePressed=true;} };
    const fireUp = e => { this.fires.delete(e.pointerId); if(game.player)game.player.touch.fire=this.fires.size>0; };
    button('开火','fire-right',fireDown,fireUp);
    button('开火','fire-left',fireDown,fireUp);
    button('跳跃','jump',()=>{game.player.touch.jump=true;});
    const crouch = button('蹲下','crouch',()=>{const p=game.player;p.touch.crouch=!p.touch.crouch;crouch.classList.toggle('on',p.touch.crouch);});
    button('换弹','reload',()=>game.player.pressed.add('KeyR'));
    button('开镜','scope',()=>{game.player.mouse.rp=true;});
    button('暂停','touch-pause',()=>game.pause());
    button('快切','quick',()=>game.player.pressed.add('KeyQ'));
    const bar=document.createElement('div');bar.className='touch-weapons';root.append(bar);
    ['主武器','手枪','刀','手雷'].forEach((label,i)=>{
      const b=button(label,`weapon-${i}`,()=>game.player.pressed.add('Digit'+(i+1)));
      bar.append(b);
    });
    bind(pad,e=>{
      if(this.padId!=null)return;
      this.padId=e.pointerId; this.move(e);
    },e=>this.move(e),e=>{
      if(e.pointerId!==this.padId)return;
      this.padId=null;knob.style.transform='translate(-50%,-50%)';
      if(game.player){game.player.touch.mx=0;game.player.touch.mz=0;}
    });
    const canvas=document.getElementById('c');
    bind(canvas,e=>{
      if(this.lookId!=null)return;
      this.lookId=e.pointerId;this.look={x:e.clientX,y:e.clientY};
    },e=>{
      if(e.pointerId!==this.lookId || !this.look)return;
      const p=game.player;p.touchLook ||= {x:0,y:0};
      p.touchLook.x+=(e.clientX-this.look.x)*1.6;p.touchLook.y+=(e.clientY-this.look.y)*1.6;
      this.look={x:e.clientX,y:e.clientY};
    },e=>{if(e.pointerId===this.lookId){this.lookId=null;this.look=null;}});
    const interrupt=()=>{this.reset();if(game.playing&&!game.ended&&!game.paused)game.pause();};
    window.addEventListener('blur',interrupt);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)interrupt();});
    window.addEventListener('resize',()=>this.reset());
  }
  move(e){
    if(e.pointerId!==this.padId)return;
    const r=this.pad.getBoundingClientRect(),max=r.width*.32;
    let x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
    const length=Math.hypot(x,y);if(length>max){x*=max/length;y*=max/length;}
    this.knob.style.transform=`translate(calc(-50% + ${x}px),calc(-50% + ${y}px))`;
    const p=this.g.player;if(p){p.touch.mx=x/max;p.touch.mz=-y/max;}
  }
  reset(){
    this.fires.clear();this.padId=null;this.lookId=null;this.look=null;
    if(this.knob)this.knob.style.transform='translate(-50%,-50%)';
    this.root?.querySelectorAll('.on').forEach(e=>e.classList.remove('on'));
    const p=this.g.player;if(!p)return;
    Object.assign(p.touch,{mx:0,mz:0,fire:false,firePressed:false,jump:false,crouch:false});
    p.touchLook={x:0,y:0};p.mouse.l=p.mouse.r=p.mouse.lp=p.mouse.rp=false;p.keys.clear();p.pressed.clear();
  }
}
