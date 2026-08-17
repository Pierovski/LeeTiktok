// --- REGISTRO DEL SERVICE WORKER ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(reg => {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') reg.update();
            });
        }).catch(err => console.error('SW Error:', err));
    });

    let refrescando = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refrescando) {
            window.location.reload();
            refrescando = true;
        }
    });
}

window.mostrarMensaje = function(texto, tipo = 'info') {
    const container = document.getElementById('toast-container');
    if(!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    let icono = '💡';
    if(tipo === 'success') icono = '✅';
    if(tipo === 'error') icono = '❌';
    
    toast.innerHTML = `<span style="font-size:1.2rem;">${icono}</span> <span>${texto}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

document.addEventListener('DOMContentLoaded', () => {
    const feedContainer = document.getElementById('feed-container');
    const streakDisplay = document.getElementById('streak');
    const displayNivel = document.getElementById('display-nivel');
    const barraProgreso = document.getElementById('level-progress-bar');
    const mascotaEl = document.getElementById('mascota');
    
    let streak = parseInt(localStorage.getItem('miRacha')) || 0;
    let nivelActual = parseInt(localStorage.getItem('miNivel')) || 1;
    let tieneEscudo = localStorage.getItem('tieneEscudo') === 'true';
    const hoy = new Date().toDateString();

    let palabrasDominadas = JSON.parse(localStorage.getItem('palabrasDominadas')) || [];
    
    let diccionarioJuegos = [...frasesDatos.filter(f => f.iconoBoton && f.texto.split(' ').length === 1).map(f => ({ palabra: f.texto, correcta: true, nivel: f.nivel, icono: f.iconoBoton }))]; 
    const dicBase = [ 
        { palabra: "Mamá", correcta: true, nivel: 1, icono: "👩‍👧" }, 
        { palabra: "Silla", correcta: true, nivel: 1, icono: "🪑" }, 
        { palabra: "Mepa", correcta: false, nivel: 1 } 
    ];
    diccionarioJuegos = diccionarioJuegos.concat(dicBase);
    let dicAdmin = JSON.parse(localStorage.getItem('dicAdmin')) || [];
    diccionarioJuegos = diccionarioJuegos.concat(dicAdmin);

    // --- SONIDOS NATIVOS ACTUALIZADOS ---
    const audioVictoria = new Audio('audios/victoria.mp3'); 
    audioVictoria.volume = 0.5;
    const audioError = new Audio('audios/error.mp3'); // Nuevo sonido de error
    audioError.volume = 0.6;

    function actualizarMascota() {
        if(streak >= 10) mascotaEl.innerText = "🦅";
        else if(streak >= 5) mascotaEl.innerText = "🐥";
        else if(streak >= 2) mascotaEl.innerText = "🐣";
        else mascotaEl.innerText = "🥚";
    }

    function aplicarEstiloNivel(nivel) {
        const root = document.documentElement;
        if (nivel === 1) { root.style.setProperty('--accent-purple', '#bb86fc'); root.style.setProperty('--accent-coral', '#ff7f50'); }
        else if (nivel === 2) { root.style.setProperty('--accent-purple', '#00e676'); root.style.setProperty('--accent-coral', '#18ffff'); } 
        else if (nivel >= 3) { root.style.setProperty('--accent-purple', '#ff9100'); root.style.setProperty('--accent-coral', '#ff1744'); } 
    }

    function actualizarBarraProgreso() {
        if(!barraProgreso) return;
        let totalTarjetas = document.querySelectorAll(`.card[data-nivel="${nivelActual}"]`).length;
        let completadas = document.querySelectorAll(`.card[data-nivel="${nivelActual}"].completada`).length;
        let porcentaje = totalTarjetas === 0 ? 0 : (completadas / totalTarjetas) * 100;
        barraProgreso.style.width = porcentaje + '%';
    }

    function registrarRachaPorLectura() {
        const rachaActualizadaHoy = localStorage.getItem('rachaActualizadaHoy');
        if (rachaActualizadaHoy !== hoy) {
            let ultimoIngresoLectura = localStorage.getItem('ultimoIngresoLectura');
            if (ultimoIngresoLectura) {
                let ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
                if (ultimoIngresoLectura === ayer.toDateString()) { streak++; } 
                else {
                    if (tieneEscudo) {
                        mostrarMensaje("¡Tu Escudo protegió tu racha! 🔥", "success");
                        localStorage.setItem('tieneEscudo', 'false'); tieneEscudo = false;
                    } else { streak = 1; }
                }
            } else { streak = 1; }
            localStorage.setItem('ultimoIngresoLectura', hoy);
            localStorage.setItem('rachaActualizadaHoy', hoy);
            localStorage.setItem('miRacha', streak);
            if(streakDisplay) streakDisplay.innerText = streak;
            actualizarMascota();
        }
    }

    document.getElementById('btn-bajar-nivel').addEventListener('click', () => {
        if (nivelActual > 1) {
            localStorage.setItem('miNivel', nivelActual - 1);
            window.location.reload(); 
        } else {
            mostrarMensaje("Ya estás en el primer nivel", "info");
        }
    });

    document.getElementById('btn-subir-nivel').addEventListener('click', () => {
        if (nivelActual < 4) { 
            localStorage.setItem('miNivel', nivelActual + 1);
            window.location.reload(); 
        } else {
            mostrarMensaje("Nivel máximo alcanzado", "info");
        }
    });

    if(displayNivel) displayNivel.innerText = nivelActual;
    if(streakDisplay) streakDisplay.innerText = streak;
    actualizarMascota();
    aplicarEstiloNivel(nivelActual);

    let vocesDisponibles = [];
    if (window.speechSynthesis) {
        vocesDisponibles = window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => vocesDisponibles = window.speechSynthesis.getVoices();
    }

    function lanzarConfeti() {
        for(let i=0; i<60; i++) {
            let confeti = document.createElement('div');
            confeti.classList.add('confeti');
            confeti.style.left = Math.random() * 100 + 'vw';
            confeti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            let colores = ['#ff7f50', '#bb86fc', '#00e676', '#ffeb3b', '#00bfff'];
            confeti.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
            document.body.appendChild(confeti);
            setTimeout(() => confeti.remove(), 4000); 
        }
    }

    window.leerTextoSimple = function(texto, vel = 0.8) {
        window.speechSynthesis.cancel();
        setTimeout(() => {
            const u = new SpeechSynthesisUtterance(texto.replace(/-/g, ''));
            const voz = vocesDisponibles.find(v => v.lang.includes('es')) || vocesDisponibles[0];
            if(voz) { u.voice = voz; u.lang = voz.lang; }
            u.rate = vel; u.pitch = 1.1;
            window.speechSynthesis.speak(u);
        }, 50);
    };

    function leerFraseConResaltado(texto, cardHtml, vel = 0.85) {
        return new Promise((resolve) => {
            window.speechSynthesis.cancel();
            setTimeout(() => {
                const u = new SpeechSynthesisUtterance(texto.replace(/-/g, ''));
                const voz = vocesDisponibles.find(v => v.lang.includes('es')) || vocesDisponibles[0];
                if(voz) { u.voice = voz; u.lang = voz.lang; }
                u.rate = vel; u.pitch = 1.1;
                const spansPalabra = cardHtml.querySelectorAll('.palabra');
                let indexActivo = 0;
                u.onboundary = (e) => {
                    if (e.name === 'word') {
                        spansPalabra.forEach(s => s.classList.remove('word-highlight'));
                        if (spansPalabra[indexActivo]) spansPalabra[indexActivo].classList.add('word-highlight');
                        indexActivo++;
                    }
                };
                u.onend = () => { spansPalabra.forEach(s => s.classList.remove('word-highlight')); resolve(); };
                u.onerror = () => { resolve(); };
                window.speechSynthesis.speak(u);
            }, 50);
        });
    }

    const btnLeerUi = document.getElementById('btn-leer-ui');
    if(btnLeerUi) {
        btnLeerUi.addEventListener('click', (e) => {
            let targets = document.querySelectorAll('.meme-modal.active .leer-ui-target, body > .leer-ui-target:not(.oculto)');
            let textoLeido = "";
            targets.forEach(t => textoLeido += t.innerText + ". ");
            if(textoLeido === "") textoLeido = "Toca las palabras de la tarjeta para leerlas.";
            e.target.classList.add('tts-activo');
            leerTextoSimple(textoLeido, 0.9);
            setTimeout(() => e.target.classList.remove('tts-activo'), 2000);
        });
    }

    let adminTaps = 0;
    const adminTrigger = document.getElementById('admin-trigger');
    if(adminTrigger) {
        adminTrigger.addEventListener('click', () => {
            adminTaps++;
            if(adminTaps === 5) {
                document.getElementById('modal-admin').classList.remove('hidden');
                setTimeout(() => document.getElementById('modal-admin').classList.add('active'), 10);
                adminTaps = 0;
            }
            setTimeout(() => adminTaps = 0, 3000);
        });
    }
    const btnGuardarAdmin = document.getElementById('btn-guardar-admin');
    if(btnGuardarAdmin){
        btnGuardarAdmin.addEventListener('click', () => {
            let pal = document.getElementById('admin-palabra').value;
            let emo = document.getElementById('admin-emoji').value;
            if(pal && emo) {
                dicAdmin.push({ palabra: pal, correcta: true, nivel: nivelActual, icono: emo });
                localStorage.setItem('dicAdmin', JSON.stringify(dicAdmin));
                mostrarMensaje("¡Palabra secreta guardada!", "success");
                document.getElementById('admin-palabra').value = "";
            } else {
                mostrarMensaje("Completa los campos", "error");
            }
        });
    }
    const btnCerrarAdmin = document.getElementById('btn-cerrar-admin');
    if(btnCerrarAdmin) {
        btnCerrarAdmin.addEventListener('click', () => {
            document.getElementById('modal-admin').classList.remove('active');
            setTimeout(() => document.getElementById('modal-admin').classList.add('hidden'), 300);
        });
    }

    const onboarding = document.getElementById('onboarding');
    if (localStorage.getItem('onboardingVisto') === 'true') { if(onboarding) onboarding.style.display = 'none'; }
    const btnEmpezar = document.getElementById('btn-empezar');
    if(btnEmpezar) {
        btnEmpezar.addEventListener('click', () => {
            let vozMuda = new SpeechSynthesisUtterance(''); vozMuda.volume = 0; window.speechSynthesis.speak(vozMuda);
            onboarding.classList.add('oculto'); localStorage.setItem('onboardingVisto', 'true'); 
            setTimeout(() => { leerTextoSimple(`Bienvenida al Nivel ${nivelActual}.`, 0.85); }, 300); 
            setTimeout(() => onboarding.style.display = 'none', 500);
        });
    }

    document.getElementById('btn-home').addEventListener('click', () => { feedContainer.scrollTo({top: 0, behavior: 'smooth'}); });

    function inicializarTarjetas() {
        if (typeof frasesDatos === 'undefined') return;
        let datosFiltrados = frasesDatos.filter(item => item.nivel === nivelActual);
        
        let historias = datosFiltrados.filter(d => d.historia);
        let sueltas = datosFiltrados.filter(d => !d.historia).sort(() => Math.random() - 0.5);
        
        historias.sort((a, b) => {
            if(a.historia === b.historia) return a.orden - b.orden;
            return a.historia - b.historia;
        });

        let datosFinales = [...historias, ...sueltas];
        feedContainer.innerHTML = "";
        
        if (datosFinales.length === 0) {
            feedContainer.innerHTML = `<div class="card"><div class="glass-content"><h2>¡Juego Terminado!</h2><p>Eres una maestra.</p></div></div>`;
            if(barraProgreso) barraProgreso.style.width = '100%';
            return;
        }

        datosFinales.forEach(item => crearTarjeta(item));
        activarBotonesVoz();
        actualizarBarraProgreso();
    }

    function crearTarjeta(item) {
        let textoBadge = item.historia ? `📖 Historia ${item.historia}` : `Nivel ${item.nivel}`;
        let htmlProcesado = item.texto.split(' ').map(p => 
            `<span class="palabra">` + p.split('-').map((s,i,arr) => 
                `<span class="silaba no-leida" onclick="window.leerSilaba(this, '${s}')">${s}</span>` + (i<arr.length-1?`<span class="guion">-</span>`:'')
            ).join('') + `</span><span class="espacio"> </span>`
        ).join('');

        const t = `<section class="card" data-nivel="${item.nivel}"><div class="glass-content" data-texto="${item.texto}"><div class="badge">${textoBadge}</div><p class="reading-text">${htmlProcesado}</p><button class="play-trigger full-phrase-btn">🔊 Ayuda</button></div></section>`;
        feedContainer.innerHTML += t;
    }
    
    inicializarTarjetas();

    window.leerSilaba = function(elementoHtml, silaba) {
        const dicFon = { "to": "tó", "te": "té", "se": "sé", "de": "dé", "tu": "tú", "mi": "mí", "si": "sí", "el": "él", "que": "ké", "qui": "kí", "crush": "crash", "pov": "pof" };
        let silAudio = dicFon[silaba.toLowerCase()] || silaba;
        
        window.speechSynthesis.cancel();
        setTimeout(() => {
            const u = new SpeechSynthesisUtterance(silAudio + ".");
            const voz = vocesDisponibles.find(v => v.lang.includes('es')) || vocesDisponibles[0];
            if(voz) { u.voice = voz; u.lang = voz.lang; }
            u.rate = 0.6; u.pitch = 1.1; window.speechSynthesis.speak(u);
        }, 20);
        
        if (elementoHtml.classList.contains('no-leida')) {
            elementoHtml.classList.remove('no-leida'); elementoHtml.classList.add('leida');
            elementoHtml.style.color = 'var(--accent-coral)'; 
            
            let card = elementoHtml.closest('.card');
            let silabasFaltantes = card.querySelectorAll('.no-leida');
            
            if (silabasFaltantes.length === 0 && !card.classList.contains('completada')) {
                card.classList.add('completada'); 
                registrarRachaPorLectura(); actualizarBarraProgreso(); lanzarConfeti(); 
                audioVictoria.play(); 
                mostrarMensaje("¡Tarjeta Completada!", "success");
                
                let btnCont = card.querySelector('.glass-content');
                const fraseCompleta = btnCont.getAttribute('data-texto');

                setTimeout(() => { leerFraseConResaltado(fraseCompleta, card, 0.85).then(() => { verificarSubidaDeNivel(card); }); }, 600); 

                let oldBtn = btnCont.querySelector('.full-phrase-btn');
                if (oldBtn) {
                    oldBtn.outerHTML = '<button class="play-trigger repetir-btn">🔁 Volver a escuchar</button>';
                    btnCont.querySelector('.repetir-btn').addEventListener('click', (e) => {
                        e.preventDefault(); e.stopPropagation(); 
                        leerFraseConResaltado(fraseCompleta, card, 0.85); 
                    });
                }
            }
        }
    };

    function activarBotonesVoz() {
        document.querySelectorAll('.full-phrase-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const card = btn.closest('.card');
                const btnCont = btn.closest('.glass-content');
                const textoFrase = btnCont.getAttribute('data-texto');
                card.classList.add('completada'); 
                
                btn.outerHTML = '<button class="play-trigger repetir-btn">🔁 Volver a escuchar</button>';
                btnCont.querySelector('.repetir-btn').addEventListener('click', (e) => {
                    e.preventDefault(); e.stopPropagation(); leerFraseConResaltado(textoFrase, card, 0.85); 
                });

                card.querySelectorAll('.no-leida').forEach(el => {
                    el.classList.remove('no-leida'); el.classList.add('leida'); el.style.color = 'var(--accent-coral)';
                });
                actualizarBarraProgreso();

                leerFraseConResaltado(textoFrase, card, 0.85).then(() => { verificarSubidaDeNivel(card); });
            });
        });
    }

    function verificarSubidaDeNivel(card) {
        let nivelTarjeta = parseInt(card.getAttribute('data-nivel'));
        if (nivelTarjeta === nivelActual) {
            let total = document.querySelectorAll(`.card[data-nivel="${nivelActual}"]`).length;
            let compl = document.querySelectorAll(`.card[data-nivel="${nivelActual}"].completada`).length;
            
            if (total === compl) {
                setTimeout(() => {
                    document.getElementById('modal-nivel').classList.remove('hidden');
                    setTimeout(() => document.getElementById('modal-nivel').classList.add('active'), 10);
                    audioVictoria.play(); 
                }, 800); 
            }
        }
    }

    document.getElementById('btn-si-nivel').addEventListener('click', () => {
        document.getElementById('modal-nivel').classList.remove('active');
        setTimeout(() => { document.getElementById('modal-nivel').classList.add('hidden'); iniciarExamenNivel(); }, 300);
    });
    document.getElementById('btn-no-nivel').addEventListener('click', () => {
        document.getElementById('modal-nivel').classList.remove('active');
        setTimeout(() => document.getElementById('modal-nivel').classList.add('hidden'), 300);
    });

    const menuJuegos = document.getElementById('modal-menu-juegos');
    document.getElementById('btn-jugar').addEventListener('click', () => {
        menuJuegos.classList.remove('hidden'); setTimeout(() => menuJuegos.classList.add('active'), 10);
    });
    document.getElementById('btn-cerrar-menu-juegos').addEventListener('click', () => {
        menuJuegos.classList.remove('active'); setTimeout(() => menuJuegos.classList.add('hidden'), 300);
    });

    const modalGlosario = document.getElementById('modal-glosario');
    document.getElementById('btn-glosario').addEventListener('click', () => {
        document.getElementById('contador-glosario').innerText = palabrasDominadas.length;
        const grid = document.getElementById('grid-glosario');
        grid.innerHTML = palabrasDominadas.map(p => `<div class="insignia-glosario">${p}</div>`).join('');
        modalGlosario.classList.remove('hidden'); setTimeout(() => modalGlosario.classList.add('active'), 10);
    });
    document.getElementById('btn-cerrar-glosario').addEventListener('click', () => {
        modalGlosario.classList.remove('active'); setTimeout(() => modalGlosario.classList.add('hidden'), 300);
    });

    // ==========================================
    // SISTEMA DE MINIJUEGOS INFINITOS
    // ==========================================

    // --- MINIJUEGO SWIPE ---
    const modalSwipe = document.getElementById('minijuego-modal');
    const tarjetaSwipe = document.getElementById('tarjeta-swipe');
    let palabraActualSwipe = null;
    let rondaSwipe = 1;

    document.getElementById('btn-abrir-swipe').addEventListener('click', () => {
        menuJuegos.classList.remove('active'); setTimeout(() => menuJuegos.classList.add('hidden'), 300);
        modalSwipe.classList.remove('hidden'); setTimeout(() => modalSwipe.classList.add('active'), 10);
        rondaSwipe = 1;
        cargarPalabraSwipe();
    });

    function cargarPalabraSwipe() {
        let disp = diccionarioJuegos.filter(p => p.nivel <= nivelActual && !palabrasDominadas.includes(p.palabra));
        if (disp.length === 0) {
            palabrasDominadas = []; localStorage.setItem('palabrasDominadas', JSON.stringify(palabrasDominadas));
            disp = diccionarioJuegos.filter(p => p.nivel <= nivelActual);
        }
        palabraActualSwipe = disp[Math.floor(Math.random() * disp.length)];
        document.getElementById('palabra-swipe').innerText = palabraActualSwipe.palabra;
        document.querySelector('#titulo-swipe').innerText = `Ronda ${rondaSwipe}: ¿Existe?`;
    }

    if(tarjetaSwipe) {
        let tIni = 0;
        tarjetaSwipe.addEventListener('touchstart', (e) => { tIni = e.changedTouches[0].screenX; tarjetaSwipe.style.transition = 'none'; });
        tarjetaSwipe.addEventListener('touchmove', (e) => {
            let dif = e.changedTouches[0].screenX - tIni;
            tarjetaSwipe.style.transform = `translate3d(${dif}px, 0, 0) rotate(${dif * 0.08}deg)`;
        });
        tarjetaSwipe.addEventListener('touchend', (e) => {
            let dif = e.changedTouches[0].screenX - tIni;
            tarjetaSwipe.style.transition = 'transform 0.3s, opacity 0.3s'; 
            if (dif > 100) { tarjetaSwipe.style.transform = `translate3d(500px, 0, 0) rotate(30deg)`; tarjetaSwipe.style.opacity = '0'; evaluarSwipe(true); } 
            else if (dif < -100) { tarjetaSwipe.style.transform = `translate3d(-500px, 0, 0) rotate(-30deg)`; tarjetaSwipe.style.opacity = '0'; evaluarSwipe(false); } 
            else { tarjetaSwipe.style.transform = `translate3d(0, 0, 0) rotate(0deg)`; }
        });
    }

    function evaluarSwipe(esDerecha) {
        if (esDerecha === palabraActualSwipe.correcta) {
            audioVictoria.play(); 
            mostrarMensaje("¡Correcto!", "success");
            if (!palabrasDominadas.includes(palabraActualSwipe.palabra)) {
                palabrasDominadas.push(palabraActualSwipe.palabra); localStorage.setItem('palabrasDominadas', JSON.stringify(palabrasDominadas));
            }
            rondaSwipe++;
        } else {
            audioError.play(); 
            tarjetaSwipe.classList.add('error-shake'); 
            modalSwipe.classList.add('flash-rojo');
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]); 
        }
        
        setTimeout(() => {
            tarjetaSwipe.style.transition = 'none'; tarjetaSwipe.style.transform = `translate3d(0, 0, 0) rotate(0deg)`; tarjetaSwipe.style.opacity = '1';
            tarjetaSwipe.classList.remove('error-shake'); modalSwipe.classList.remove('flash-rojo');
            cargarPalabraSwipe(); 
        }, 600);
    }
    document.getElementById('btn-cerrar-minijuego').addEventListener('click', () => { modalSwipe.classList.remove('active'); setTimeout(() => modalSwipe.classList.add('hidden'), 300); });

    // --- MINIJUEGO LETRAS (ABECEDARIO) ---
    const modalLetras = document.getElementById('minijuego-letras');
    let letraObjetivo = "";
    let rondaLetras = 1;
    
    document.getElementById('btn-abrir-letras').addEventListener('click', () => {
        menuJuegos.classList.remove('active'); setTimeout(() => menuJuegos.classList.add('hidden'), 300);
        modalLetras.classList.remove('hidden'); setTimeout(() => modalLetras.classList.add('active'), 10);
        rondaLetras = 1;
        generarOpcionesLetras();
    });

    function generarOpcionesLetras() {
        const abecedario = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
        const cont = document.getElementById('contenedor-opciones-letras');
        cont.innerHTML = "";
        let ops = [];
        while(ops.length < 4) { let r = abecedario[Math.floor(Math.random() * abecedario.length)]; if(!ops.includes(r)) ops.push(r); }
        letraObjetivo = ops[Math.floor(Math.random() * ops.length)];
        
        document.getElementById('titulo-letras').innerText = `Ronda ${rondaLetras}: ¿Letra ${letraObjetivo}?`;

        ops.forEach(l => {
            let btn = document.createElement('button'); btn.innerText = l;
            btn.style.cssText = `background: rgba(255,255,255,0.05); border: 2px solid rgba(187,134,252,0.5); color: white; font-size: 2.5rem; font-weight: bold; padding: 20px; border-radius: 20px; cursor: pointer; transition: all 0.2s;`;
            btn.onclick = () => {
                if(l === letraObjetivo) {
                    audioVictoria.play(); 
                    btn.style.backgroundColor = 'rgba(0, 230, 118, 0.4)'; 
                    btn.style.borderColor = '#00e676';
                    mostrarMensaje("¡Excelente!", "success");
                    rondaLetras++;
                    setTimeout(generarOpcionesLetras, 800);
                } else {
                    audioError.play(); 
                    btn.classList.add('error-shake'); btn.style.backgroundColor = 'rgba(255, 23, 68, 0.4)'; btn.style.borderColor = '#ff1744';
                    if(navigator.vibrate) navigator.vibrate([50, 50, 50]);
                    setTimeout(() => { btn.classList.remove('error-shake'); btn.style.backgroundColor = 'rgba(255,255,255,0.05)'; btn.style.borderColor = 'rgba(187,134,252,0.5)'; }, 400);
                }
            };
            cont.appendChild(btn);
        });
        leerTextoSimple(`Toca la letra ${letraObjetivo}`, 0.8);
    }
    
    document.getElementById('btn-escuchar-letra-juego').addEventListener('click', () => leerTextoSimple(`¿Dónde está la letra ${letraObjetivo}?`, 0.7));
    document.getElementById('btn-cerrar-letras').addEventListener('click', () => { modalLetras.classList.remove('active'); setTimeout(() => modalLetras.classList.add('hidden'), 300); });

    // --- MEMORAMA (RONDAS INFINITAS) ---
    const modalMemorama = document.getElementById('minijuego-memorama');
    let memoVolteadas = [], aciertosMemo = 0, rondaMemorama = 1;
    
    document.getElementById('btn-abrir-memorama').addEventListener('click', () => {
        menuJuegos.classList.remove('active'); setTimeout(() => menuJuegos.classList.add('hidden'), 300);
        modalMemorama.classList.remove('hidden'); setTimeout(() => modalMemorama.classList.add('active'), 10);
        rondaMemorama = 1;
        iniciarMemorama();
    });

    function iniciarMemorama() {
        document.querySelector('#ronda-memorama').innerText = `Ronda ${rondaMemorama}`;
        let validas = diccionarioJuegos.filter(p => p.correcta && p.icono);
        let seleccion = validas.sort(() => 0.5 - Math.random()).slice(0, 4); 
        let memoCartas = [];
        seleccion.forEach(s => {
            memoCartas.push({ val: s.palabra, id: s.palabra });
            memoCartas.push({ val: s.icono, id: s.palabra });
        });
        memoCartas.sort(() => 0.5 - Math.random());
        aciertosMemo = 0; memoVolteadas = [];
        
        let grid = document.getElementById('grid-memorama');
        grid.innerHTML = memoCartas.map((c, i) => `<div class="carta-memo carta-oculta" data-id="${c.id}">${c.val}</div>`).join('');
        grid.querySelectorAll('.carta-memo').forEach(c => c.addEventListener('click', voltearCartaMemo));
    }

    function voltearCartaMemo(e) {
        let c = e.target;
        if(!c.classList.contains('carta-oculta') || memoVolteadas.length >= 2) return;
        
        c.classList.remove('carta-oculta'); memoVolteadas.push(c);
        if(memoVolteadas.length === 2) {
            if(memoVolteadas[0].getAttribute('data-id') === memoVolteadas[1].getAttribute('data-id')) {
                audioVictoria.play();
                aciertosMemo++; 
                memoVolteadas[0].classList.add('carta-match'); 
                memoVolteadas[1].classList.add('carta-match'); 
                memoVolteadas = [];
                
                if(aciertosMemo === 4) {
                    lanzarConfeti(); 
                    mostrarMensaje("¡Tablero dominado!", "success");
                    rondaMemorama++;
                    setTimeout(() => { iniciarMemorama(); }, 1500); 
                }
            } else {
                audioError.play();
                setTimeout(() => { memoVolteadas[0].classList.add('carta-oculta'); memoVolteadas[1].classList.add('carta-oculta'); memoVolteadas = []; }, 1000);
            }
        }
    }
    document.getElementById('btn-cerrar-memorama').addEventListener('click', () => { modalMemorama.classList.remove('active'); setTimeout(() => modalMemorama.classList.add('hidden'), 300); });

    // --- CONSTRUCTOR DE ORACIONES (INFINITO) ---
    const modalOraciones = document.getElementById('minijuego-oraciones');
    let oracionObjetivo = [];
    let rondaOraciones = 1;
    
    document.getElementById('btn-abrir-oraciones').addEventListener('click', () => {
        menuJuegos.classList.remove('active'); setTimeout(() => menuJuegos.classList.add('hidden'), 300);
        modalOraciones.classList.remove('hidden'); setTimeout(() => modalOraciones.classList.add('active'), 10);
        rondaOraciones = 1;
        iniciarOracion();
    });

    function iniciarOracion() {
        document.querySelector('#titulo-oraciones').innerText = `Ronda ${rondaOraciones}: Arma la frase`;
        let fraseObj = frasesDatos[Math.floor(Math.random() * frasesDatos.length)];
        let fraseLimpia = fraseObj.texto.replace(/-/g, '');
        oracionObjetivo = fraseLimpia.split(' ');
        
        let bloquesAleatorios = [...oracionObjetivo].sort(() => 0.5 - Math.random());
        document.getElementById('zona-construccion').innerHTML = '';
        const zonaBloques = document.getElementById('zona-bloques');
        zonaBloques.innerHTML = bloquesAleatorios.map(b => `<div class="bloque-palabra">${b}</div>`).join('');
        
        zonaBloques.querySelectorAll('.bloque-palabra').forEach(b => { b.addEventListener('click', () => { document.getElementById('zona-construccion').appendChild(b); }); });
        document.getElementById('zona-construccion').addEventListener('click', (e) => { if(e.target.classList.contains('bloque-palabra')) zonaBloques.appendChild(e.target); });
    }

    document.getElementById('btn-verificar-oracion').addEventListener('click', () => {
        let construida = Array.from(document.getElementById('zona-construccion').children).map(c => c.innerText);
        if(construida.join(' ') === oracionObjetivo.join(' ')) {
            audioVictoria.play();
            mostrarMensaje("¡Oración perfecta!", "success");
            rondaOraciones++;
            setTimeout(() => iniciarOracion(), 1000);
        } else {
            audioError.play();
            document.getElementById('zona-construccion').classList.add('error-shake');
            setTimeout(() => document.getElementById('zona-construccion').classList.remove('error-shake'), 400);
        }
    });
    document.getElementById('btn-cerrar-oraciones').addEventListener('click', () => { modalOraciones.classList.remove('active'); setTimeout(() => modalOraciones.classList.add('hidden'), 300); });

    // --- ESCRITURA Y VOZ (INFINITO) ---
    const modalEscritura = document.getElementById('minijuego-escritura');
    const inputEscritura = document.getElementById('input-escritura');
    let palabraObjetivoEscritura = "";
    let rondaEscritura = 1;
    
    document.getElementById('btn-abrir-escritura').addEventListener('click', () => {
        menuJuegos.classList.remove('active'); setTimeout(() => menuJuegos.classList.add('hidden'), 300);
        modalEscritura.classList.remove('hidden'); setTimeout(() => modalEscritura.classList.add('active'), 10);
        rondaEscritura = 1;
        iniciarEscritura();
    });

    function iniciarEscritura() {
        document.querySelector('#titulo-escritura').innerText = `Ronda ${rondaEscritura}: ¿Qué ves aquí?`;
        let s = diccionarioJuegos[Math.floor(Math.random() * diccionarioJuegos.length)];
        palabraObjetivoEscritura = s.palabra; 
        document.getElementById('imagen-leer').innerText = s.icono || '❓';
        inputEscritura.value = "";
    }

    document.getElementById('btn-escuchar-palabra').addEventListener('click', () => leerTextoSimple(palabraObjetivoEscritura));
    
    document.getElementById('btn-dictar-voz').addEventListener('click', () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return mostrarMensaje("Microfono no soportado.", "error");
        const reco = new SpeechRecognition(); reco.lang = 'es-PE';
        reco.onstart = () => { document.getElementById('btn-dictar-voz').style.background = 'rgba(255,23,68,0.3)'; };
        reco.onresult = (e) => { inputEscritura.value = e.results[0][0].transcript; document.getElementById('btn-verificar-escritura').click(); };
        reco.onend = () => { document.getElementById('btn-dictar-voz').style.background = 'rgba(0,230,118,0.2)'; };
        reco.start();
    });

    document.getElementById('btn-verificar-escritura').addEventListener('click', () => {
        let textIn = inputEscritura.value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        let textReal = palabraObjetivoEscritura.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if(textIn === textReal) {
            audioVictoria.play();
            mostrarMensaje("¡Bien escrito!", "success");
            if(!palabrasDominadas.includes(palabraObjetivoEscritura)) {
                palabrasDominadas.push(palabraObjetivoEscritura); localStorage.setItem('palabrasDominadas', JSON.stringify(palabrasDominadas));
            }
            rondaEscritura++;
            setTimeout(() => iniciarEscritura(), 1000);
        } else {
            audioError.play();
            inputEscritura.classList.add('error-shake'); setTimeout(() => inputEscritura.classList.remove('error-shake'), 400);
        }
    });
    document.getElementById('btn-cerrar-escritura').addEventListener('click', () => { modalEscritura.classList.remove('active'); setTimeout(() => modalEscritura.classList.add('hidden'), 300); });

    // --- 7. JEFE FINAL (EXAMEN) ---
    const modalExamen = document.getElementById('modal-examen');
    let timerJefe;
    
    window.iniciarExamenNivel = function() {
        modalExamen.classList.remove('hidden'); setTimeout(() => modalExamen.classList.add('active', 'boss-mode'), 10);
        document.getElementById('examen-nivel-texto').innerText = nivelActual;
        
        let seleccion = diccionarioJuegos.filter(p => p.correcta).sort(() => 0.5 - Math.random())[0];
        document.getElementById('imagen-examen').innerText = seleccion.icono || '❓';
        let objetivoJefe = seleccion.palabra.toLowerCase();
        document.getElementById('input-examen').value = "";
        
        let tiempoJ = 30; document.getElementById('timer-jefe').innerText = `⏱️ ${tiempoJ}s`;
        clearInterval(timerJefe);
        timerJefe = setInterval(() => {
            tiempoJ--; document.getElementById('timer-jefe').innerText = `⏱️ ${tiempoJ}s`;
            if(tiempoJ <= 0) {
                clearInterval(timerJefe); 
                audioError.play();
                mostrarMensaje("¡El jefe te venció! Faltó tiempo.", "error");
                modalExamen.classList.remove('active', 'boss-mode'); setTimeout(() => modalExamen.classList.add('hidden'), 300);
            }
        }, 1000);

        document.getElementById('btn-verificar-examen').onclick = () => {
            if(document.getElementById('input-examen').value.toLowerCase().trim() === objetivoJefe) {
                clearInterval(timerJefe); nivelActual++; localStorage.setItem('miNivel', nivelActual);
                audioVictoria.play();
                mostrarMensaje(`¡JEFE DERROTADO! Nivel ${nivelActual} alcanzado 🏆`, "success");
                modalExamen.classList.remove('active', 'boss-mode'); setTimeout(() => modalExamen.classList.add('hidden'), 300);
                setTimeout(() => window.location.reload(), 1500); 
            } else {
                audioError.play();
                document.getElementById('tarjeta-examen').classList.add('error-shake');
                setTimeout(() => document.getElementById('tarjeta-examen').classList.remove('error-shake'), 400);
            }
        };
    };
});
