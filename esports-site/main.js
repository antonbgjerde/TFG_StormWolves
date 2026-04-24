// main.js - menú hamburguesa, modales y accesibilidad básica
document.addEventListener('DOMContentLoaded', function(){
  // NAV TOGGLE
  const btn = document.getElementById('navToggle');
  const menu = document.getElementById('mainMenu');
  if(btn && menu){
    btn.addEventListener('click', ()=>{
      const open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      // animate hamburger
      btn.classList.toggle('open');
    });
    // close menu on outside click (mobile)
    document.addEventListener('click', (e)=>{
      if(menu.classList.contains('open') && !menu.contains(e.target) && e.target !== btn){
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
      }
    });
  }

  // MODAL HANDLING (generic)
  function trapFocus(modal){
    const focusable = modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select');
    if(!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length -1];
    modal.addEventListener('keydown', function(e){
      if(e.key === 'Tab'){
        if(e.shiftKey && document.activeElement === first){
          e.preventDefault(); last.focus();
        } else if(!e.shiftKey && document.activeElement === last){
          e.preventDefault(); first.focus();
        }
      } else if(e.key === 'Escape'){
        closeModal(modal.id);
      }
    });
    first.focus();
  }

  window.openModal = function(id){
    const m = document.getElementById(id);
    if(!m) return;
    m.classList.add('open');
    m.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    trapFocus(m);
  }

  window.closeModal = function(id){
    const m = document.getElementById(id);
    if(!m) return;
    m.classList.remove('open');
    m.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    // return focus to last clicked element could be implemented if stored
  }

  // Wire close buttons
  document.querySelectorAll('.modal .close').forEach(btn => {
    btn.addEventListener('click', (e)=>{
      const modal = btn.closest('.modal');
      if(modal) closeModal(modal.id);
    });
  });

  // close modal when clicking backdrop
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e)=>{
      if(e.target === modal) closeModal(modal.id);
    });
  });

});
