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

// --- UTILIDADES GLOBALES ---
window.mostrarMensaje = function(texto, tipo = 'info') {
    const container = document.getElementById('toast-container');
    if(!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    const iconos = { 'success': '✅', 'error': '❌', 'info': '💡' };
    const icono = iconos[tipo] || iconos['info'];
    
    toast.innerHTML = `<span style="font-size:1.2rem;">${icono}</span> <span>${texto}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// --- SONIDOS NATIVOS CON PROTECCIÓN ---
const AudioUI = {
    victoria: new Audio('error.mp3'), // Fallback seguro si está en raíz o carpeta
    error: new Audio('error.mp3'),
    playVictoria() {
        this.victoria.currentTime = 0;
        this.victoria.play().catch(() => {});
    },
    playError() {
        this.error.currentTime = 0;
        this.error.play().catch(() => {});
    }
};
// Intentamos cargar desde carpeta audios/ o raíz según tu estructura
AudioUI.victoria.src = 'victoria.mp3';
AudioUI.victoria.onerror = () => { AudioUI.victoria.src = 'audios/victoria.mp3'; };
AudioUI.error.src = 'error.mp3';
AudioUI.error.onerror = () => { AudioUI.error.src = 'audios/error.mp3'; };
AudioUI.victoria.volume = 0.5;
AudioUI.error.volume = 0.5;

// --- GESTIÓN DE ESTADO UNIFICADA ---
const AppState = {
    state: {
        streak: parseInt(localStorage.getItem('streak') || localStorage.getItem('miRacha')) || 0,
        nivelActual: parseInt(localStorage.getItem('nivelActual') || localStorage.getItem('miNivel')) || 1,
        tieneEscudo: localStorage.getItem('tieneEscudo') === 'true',
        palabrasDominadas: JSON.parse(localStorage.getItem('palabrasDominadas')) || [],
        dicAdmin: JSON.parse(localStorage.getItem('dicAdmin')) || [],
        rachaActualizadaHoy: localStorage.getItem('rachaActualizadaHoy'),
        ultimoIngresoLectura: localStorage.getItem('ultimoIngresoLectura'),
        vozPreferidaURI: localStorage.getItem('vozPreferidaURI') || ''
    },
    listeners: [],
    
    subscribe(listener) {
        this.listeners.push(listener);
        listener(this.state);
    },
    
    update(key, value) {
        this.state[key] = value;
        const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
        localStorage.setItem(key, valueToStore);
        // Compatibilidad con nombres antiguos
        if (key === 'nivelActual') localStorage.setItem('miNivel', valueToStore);
        if (key === 'streak') localStorage.setItem('miRacha', valueToStore);
        this.notify();
    },
    
    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const DOM = {
        feedContainer: document.getElementById('feed-container'),
        streakDisplay: document.getElementById('streak'),
        escudoBadge: document.getElementById('escudo-badge'),
        displayNivel: document.getElementById('display-nivel'),
        barraProgreso: document.getElementById('level-progress-bar'),
        mascotaEl: document.getElementById('mascota'),
        selectVozAdmin: document.getElementById('select-voz-admin'),
        modales: {
            admin: document.getElementById('modal-admin'),
            nivel: document.getElementById('modal-nivel'),
            menuJuegos: document.getElementById('modal-menu-juegos'),
            glosario: document.getElementById('modal-glosario'),
            swipe: document.getElementById('minijuego-modal'),
            letras: document.getElementById('minijuego-letras'),
            silabas: document.getElementById('minijuego-silabas'),
            memorama: document.getElementById('minijuego-memorama'),
            oraciones: document.getElementById('minijuego-oraciones'),
            escritura: document.getElementById('minijuego-escritura'),
            examen: document.getElementById('modal-examen')
        }
    };
    
    // --- LÓGICA DE DICCIONARIO COMPLETO ---
    function obtenerDiccionario() {
        const base = typeof palabrasDatos !== 'undefined' ? palabrasDatos : [];
        return [...base, ...AppState.state.dicAdmin];
    }

    // --- RENDERIZADO REACTIVO DE UI ---
    AppState.subscribe((state) => {
        if(DOM.streakDisplay) DOM.streakDisplay.innerText = state.streak;
        if(DOM.displayNivel) DOM.displayNivel.innerText = state.nivelActual;
        if(DOM.escudoBadge) {
            DOM.escudoBadge.classList.toggle('hidden', !state.tieneEscudo);
        }
        
        if(DOM.mascotaEl) {
            if(state.streak >= 10) DOM.mascotaEl.innerText = "🦅";
            else if(state.streak >= 5) DOM.mascotaEl.innerText = "🐥";
            else if(state.streak >= 2) DOM.mascotaEl.innerText = "🐣";
            else DOM.mascotaEl.innerText = "🥚";
        }

        const root = document.documentElement;
        if (state.nivelActual === 1) { root.style.setProperty('--accent-purple', '#bb86fc'); root.style.setProperty('--accent-coral', '#ff7f50'); }
        else if (state.nivelActual === 2) { root.style.setProperty('--accent-purple', '#00e676'); root.style.setProperty('--accent-coral', '#18ffff'); } 
        else if (state.nivelActual >= 3) { root.style.setProperty('--accent-purple', '#ff9100'); root.style.setProperty('--accent-coral', '#ff1744'); } 
    });

    function actualizarBarraProgreso() {
        if(!DOM.barraProgreso) return;
        const totalTarjetas = document.querySelectorAll(`.card[data-nivel="${AppState.state.nivelActual}"]`).length;
        const completadas = document.querySelectorAll(`.card[data-nivel="${AppState.state.nivelActual}"].completada`).length;
        const porcentaje = totalTarjetas === 0 ? 0 : (completadas / totalTarjetas) * 100;
        DOM.barraProgreso.style.width = `${porcentaje}%`;
    }

    function registrarRachaPorLectura() {
        const hoy = new Date().toDateString();
        if (AppState.state.rachaActualizadaHoy !== hoy) {
            let nuevaRacha = AppState.state.streak;
            let tieneEscudo = AppState.state.tieneEscudo;
            
            if (AppState.state.ultimoIngresoLectura) {
                let ayer = new Date(); 
                ayer.setDate(ayer.getDate() - 1);
                
                if (AppState.state.ultimoIngresoLectura === ayer.toDateString()) { 
                    nuevaRacha++; 
                } else if (tieneEscudo) {
                    window.mostrarMensaje("¡Tu Escudo 🛡️ protegió tu racha! 🔥", "success");
                    AppState.update('tieneEscudo', false);
                } else { 
                    nuevaRacha = 1; 
                }
            } else { 
                nuevaRacha = 1; 
            }
            
            AppState.update('ultimoIngresoLectura', hoy);
            AppState.update('rachaActualizadaHoy', hoy);
            AppState.update('streak', nuevaRacha);
        }
    }

    // --- MOTOR DE SÍNTESIS DE VOZ NATURAL (ANDROID + OFFLINE/ONLINE) ---
    let vocesDisponibles = [];

    function puntuarVozEspanol(v) {
        const lang = (v.lang || '').toLowerCase();
        const name = (v.name || '').toLowerCase();
        if (!lang.startsWith('es')) return -1;

        let score = 10;
        // Preferencia regional Perú / Latinoamérica
        if (lang.includes('pe')) score += 50;
        else if (lang.includes('419') || lang.includes('us') || lang.includes('mx') || lang.includes('co') || lang.includes('cl') || lang.includes('ar')) score += 40;
        else if (lang.includes('es')) score += 15;

        // Preferencia por motores neuronales / naturales de Google y Microsoft
        if (name.includes('natural') || name.includes('neural')) score += 60;
        if (name.includes('google')) score += 35;
        if (name.includes('network') || name.includes('online')) score += 20;
        if (name.includes('sabina') || name.includes('dalia') || name.includes('paulina') || name.includes('helena')) score += 25;

        return score;
    }

    function cargarVoces() {
        if (!window.speechSynthesis) return;
        const todas = window.speechSynthesis.getVoices();
        if (!todas.length) return;

        vocesDisponibles = todas
            .filter(v => (v.lang || '').toLowerCase().startsWith('es'))
            .sort((a, b) => puntuarVozEspanol(b) - puntuarVozEspanol(a));

        if (vocesDisponibles.length === 0) vocesDisponibles = todas;

        // Poblar el selector del Panel Admin
        if (DOM.selectVozAdmin) {
            DOM.selectVozAdmin.innerHTML = vocesDisponibles.map(v => 
                `<option value="${v.voiceURI}" ${v.voiceURI === AppState.state.vozPreferidaURI ? 'selected' : ''}>${v.name} (${v.lang})</option>`
            ).join('');
        }
    }

    if (window.speechSynthesis) {
        cargarVoces();
        window.speechSynthesis.onvoiceschanged = cargarVoces;
    }

    function obtenerMejorVoz() {
        if (!vocesDisponibles.length) cargarVoces();
        if (AppState.state.vozPreferidaURI) {
            const preferida = vocesDisponibles.find(v => v.voiceURI === AppState.state.vozPreferidaURI);
            if (preferida) return preferida;
        }
        return vocesDisponibles[0] || null;
    }

    window.leerTextoSimple = function(texto, vel = 0.88) {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        setTimeout(() => {
            const limpio = texto.replace(/-/g, '');
            const u = new SpeechSynthesisUtterance(limpio);
            const voz = obtenerMejorVoz();
            if (voz) { u.voice = voz; u.lang = voz.lang; }
            else { u.lang = 'es-PE'; }
            u.rate = vel;
            u.pitch = 1.0; // Tono 1.0 evita que suene metálica o robotizada
            window.speechSynthesis.speak(u);
        }, 40);
    };

    function leerFraseConResaltado(texto, cardHtml, vel = 0.88) {
        return new Promise((resolve) => {
            if (!window.speechSynthesis) return resolve();
            window.speechSynthesis.cancel();
            setTimeout(() => {
                const textoLimpio = texto.replace(/-/g, '');
                const u = new SpeechSynthesisUtterance(textoLimpio);
                const voz = obtenerMejorVoz();
                if (voz) { u.voice = voz; u.lang = voz.lang; }
                else { u.lang = 'es-PE'; }
                u.rate = vel;
                u.pitch = 1.0;

                const spansPalabra = cardHtml.querySelectorAll('.palabra');
                let indexActivo = 0;

                u.onboundary = (e) => {
                    if (e.name === 'word') {
                        spansPalabra.forEach(s => s.classList.remove('word-highlight'));
                        if (spansPalabra[indexActivo]) spansPalabra[indexActivo].classList.add('word-highlight');
                        indexActivo++;
                    }
                };
                u.onend = () => {
                    spansPalabra.forEach(s => s.classList.remove('word-highlight'));
                    resolve();
                };
                u.onerror = () => {
                    spansPalabra.forEach(s => s.classList.remove('word-highlight'));
                    resolve();
                };
                window.speechSynthesis.speak(u);
            }, 50);
        });
    }

    // --- CONTROLES DE NIVEL SIN RECARGAR PÁGINA ---
    document.getElementById('btn-bajar-nivel')?.addEventListener('click', () => {
        if (AppState.state.nivelActual > 1) {
            AppState.update('nivelActual', AppState.state.nivelActual - 1);
            inicializarTarjetas();
        } else {
            window.mostrarMensaje("Ya estás en el Nivel 1", "info");
        }
    });

    document.getElementById('btn-subir-nivel')?.addEventListener('click', () => {
        if (AppState.state.nivelActual < 4) { 
            AppState.update('nivelActual', AppState.state.nivelActual + 1);
            inicializarTarjetas();
        } else {
            window.mostrarMensaje("¡Estás en el nivel máximo!", "info");
        }
    });

    // --- UTILIDADES DE UI ---
    function lanzarConfeti() {
        const fragment = document.createDocumentFragment();
        const colores = ['#ff7f50', '#bb86fc', '#00e676', '#ffeb3b', '#00bfff'];
        
        for(let i=0; i<50; i++) {
            let confeti = document.createElement('div');
            confeti.className = 'confeti';
            confeti.style.left = `${Math.random() * 100}vw`;
            confeti.style.animationDuration = `${Math.random() * 2 + 1.8}s`;
            confeti.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
            fragment.appendChild(confeti);
        }
        
        document.body.appendChild(fragment);
        setTimeout(() => {
            document.querySelectorAll('.confeti').forEach(c => c.remove());
        }, 3800); 
    }

    function toggleModal(modalElement, mostrar) {
        if(!modalElement) return;
        if(mostrar) {
            modalElement.classList.remove('hidden');
            setTimeout(() => modalElement.classList.add('active'), 10);
        } else {
            modalElement.classList.remove('active');
            setTimeout(() => modalElement.classList.add('hidden'), 300);
        }
    }

    // --- GUÍA VISUAL DE SÍLABA ACTUAL (Izquierda a Derecha) ---
    function actualizarFocoSilaba(card) {
        card.querySelectorAll('.silaba').forEach(s => s.classList.remove('silaba-foco'));
        const siguiente = card.querySelector('.silaba.no-leida');
        if (siguiente) siguiente.classList.add('silaba-foco');
    }

    // --- INICIALIZACIÓN DE TARJETAS DEL FEED ---
    function inicializarTarjetas() {
        if (typeof frasesDatos === 'undefined') return;
        const nivel = AppState.state.nivelActual;
        
        let historias = frasesDatos.filter(item => item.nivel === nivel && item.historia)
                                   .sort((a, b) => a.historia === b.historia ? a.orden - b.orden : a.historia - b.historia);
        let sueltas = frasesDatos.filter(item => item.nivel === nivel && !item.historia)
                                 .sort(() => Math.random() - 0.5);
        
        let datosFinales = [...historias, ...sueltas];
        
        if (datosFinales.length === 0) {
            DOM.feedContainer.innerHTML = `<div class="card"><div class="glass-content"><h2>¡Nivel Completado! 🎉</h2><p>Usa las flechas de arriba o explora los minijuegos.</p></div></div>`;
            if(DOM.barraProgreso) DOM.barraProgreso.style.width = '100%';
            return;
        }

        const htmlTarjetas = datosFinales.map(item => {
            let textoBadge = item.historia ? `📖 Historia ${item.historia} • Parte ${item.orden}` : `Nivel ${item.nivel} • ${item.tipo.toUpperCase()}`;
            let emojiVisual = item.iconoBoton || '✨';

            let htmlProcesado = item.texto.split(' ').map(p => 
                `<span class="palabra">` + p.split('-').map((s,i,arr) => 
                    `<span class="silaba no-leida" onclick="window.leerSilaba(this, '${s}')">${s}</span>` + (i<arr.length-1?`<span class="guion">-</span>`:'')
                ).join('') + `</span><span class="espacio"> </span>`
            ).join('');

            return `<section class="card" data-nivel="${item.nivel}">
                        <div class="glass-content" data-texto="${item.texto}">
                            <div class="badge">${textoBadge}</div>
                            <div class="card-emoji">${emojiVisual}</div>
                            <p class="reading-text">${htmlProcesado}</p>
                            <button class="play-trigger full-phrase-btn">🔊 Escuchar frase</button>
                            <div class="scroll-hint hidden">⬆️ Desliza hacia arriba</div>
                        </div>
                    </section>`;
        }).join('');

        DOM.feedContainer.innerHTML = htmlTarjetas;
        DOM.feedContainer.scrollTo({ top: 0 });
        
        // Iluminar la primera sílaba de cada tarjeta como guía visual
        document.querySelectorAll('.card').forEach(c => actualizarFocoSilaba(c));
        activarBotonesVoz();
        actualizarBarraProgreso();
    }

    // --- LECTURA FONÉTICA NATURAL DE SÍLABAS + EFECTO KARAOKE INVERSO ---
    window.leerSilaba = function(elementoHtml, silaba) {
        // Mapa fonético con alargamiento vocálico suave para que el TTS de Android pronuncie la sílaba clara y natural
        const dicFon = { 
            "ma": "maa", "me": "mee", "mi": "mii", "mo": "moo", "mu": "muu",
            "pa": "paa", "pe": "pee", "pi": "pii", "po": "poo", "pu": "puu",
            "sa": "saa", "se": "see", "si": "sii", "so": "soo", "su": "suu",
            "la": "laa", "le": "lee", "li": "lii", "lo": "loo", "lu": "luu",
            "ta": "taa", "te": "tee", "ti": "tii", "to": "too", "tu": "tuu",
            "da": "daa", "de": "dee", "di": "dii", "do": "doo", "du": "duu",
            "na": "naa", "ne": "nee", "ni": "nii", "no": "noo", "nu": "nuu",
            "ca": "kaa", "co": "koo", "cu": "kuu", "que": "kee", "qui": "kii",
            "ba": "baa", "be": "bee", "bi": "bii", "bo": "boo", "bu": "buu",
            "va": "baa", "ve": "bee", "vi": "bii", "vo": "boo", "vu": "buu",
            "ga": "gaa", "go": "goo", "gu": "guu", "ja": "jaa", "je": "jee", "ji": "jii", "jo": "joo", "ju": "juu",
            "ra": "raa", "re": "ree", "ri": "rii", "ro": "roo", "ru": "ruu",
            "el": "él", "un": "un", "es": "es", "crush": "crash", "pov": "pof"
        };
        let limpia = silaba.toLowerCase().replace(/[.,!¡?¿]/g, '');
        let silAudio = dicFon[limpia] || limpia;
        
        window.leerTextoSimple(silAudio, 0.82);
        
        if (elementoHtml.classList.contains('no-leida')) {
            elementoHtml.classList.replace('no-leida', 'leida');
            elementoHtml.classList.remove('silaba-foco');
            
            const palabraContenedor = elementoHtml.closest('.palabra');
            const card = elementoHtml.closest('.card');

            // EFECTO KARAOKE INVERSO: Si terminó todas las sílabas de esta palabra, ocultar guiones y unir la palabra
            if (palabraContenedor && palabraContenedor.querySelectorAll('.no-leida').length === 0) {
                palabraContenedor.classList.add('palabra-unida');
            }

            actualizarFocoSilaba(card);
            
            // Si completó todas las sílabas de la tarjeta
            if (card.querySelectorAll('.no-leida').length === 0 && !card.classList.contains('completada')) {
                completarTarjeta(card);
            }
        }
    };

    function completarTarjeta(card) {
        card.classList.add('completada');
        card.querySelectorAll('.palabra').forEach(p => p.classList.add('palabra-unida'));
        registrarRachaPorLectura();
        actualizarBarraProgreso();
        lanzarConfeti();
        AudioUI.playVictoria();

        const btnCont = card.querySelector('.glass-content');
        const fraseCompleta = btnCont.getAttribute('data-texto');
        const scrollHint = card.querySelector('.scroll-hint');
        if (scrollHint) scrollHint.classList.remove('hidden');

        setTimeout(() => {
            leerFraseConResaltado(fraseCompleta, card, 0.9).then(() => verificarSubidaDeNivel(card));
        }, 550);

        let oldBtn = btnCont.querySelector('.full-phrase-btn');
        if (oldBtn) {
            oldBtn.outerHTML = '<button class="play-trigger repetir-btn">🔁 Volver a escuchar</button>';
            btnCont.querySelector('.repetir-btn').addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                leerFraseConResaltado(fraseCompleta, card, 0.9);
            });
        }
    }

    function activarBotonesVoz() {
        document.querySelectorAll('.full-phrase-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const card = btn.closest('.card');
                if (!card) return;
                card.querySelectorAll('.no-leida').forEach(el => {
                    el.classList.replace('no-leida', 'leida');
                    el.classList.remove('silaba-foco');
                });
                completarTarjeta(card);
            });
        });
    }

    function verificarSubidaDeNivel(card) {
        const nivel = AppState.state.nivelActual;
        let nivelTarjeta = parseInt(card.getAttribute('data-nivel'));
        
        if (nivelTarjeta === nivel) {
            let total = document.querySelectorAll(`.card[data-nivel="${nivel}"]`).length;
            let compl = document.querySelectorAll(`.card[data-nivel="${nivel}"].completada`).length;
            
            if (total > 0 && total === compl) {
                setTimeout(() => {
                    toggleModal(DOM.modales.nivel, true);
                    AudioUI.playVictoria();
                }, 700); 
            }
        }
    }

    // Botón "Todavía no, seguir practicando" del modal de nivel (Bug corregido)
    document.getElementById('btn-no-nivel')?.addEventListener('click', () => {
        toggleModal(DOM.modales.nivel, false);
    });

    inicializarTarjetas();

    // --- EVENTOS DE NAVEGACIÓN Y MENÚS ---
    document.getElementById('btn-home')?.addEventListener('click', () => DOM.feedContainer.scrollTo({top: 0, behavior: 'smooth'}));
    document.getElementById('btn-jugar')?.addEventListener('click', () => toggleModal(DOM.modales.menuJuegos, true));
    document.getElementById('btn-cerrar-menu-juegos')?.addEventListener('click', () => toggleModal(DOM.modales.menuJuegos, false));

    document.getElementById('btn-glosario')?.addEventListener('click', () => {
        const dominadas = AppState.state.palabrasDominadas;
        document.getElementById('contador-glosario').innerText = dominadas.length;
        document.getElementById('grid-glosario').innerHTML = dominadas.length
            ? dominadas.map(p => `<div class="insignia-glosario" onclick="window.leerTextoSimple('${p}', 0.85)">${p} 🔊</div>`).join('')
            : `<p style="grid-column: 1 / -1; color: var(--text-dim);">Juega en la Zona de Práctica para coleccionar palabras aquí.</p>`;
        toggleModal(DOM.modales.glosario, true);
    });
    document.getElementById('btn-cerrar-glosario')?.addEventListener('click', () => toggleModal(DOM.modales.glosario, false));

    // --- ONBOARDING Y UI FLOTANTE ---
    const onboarding = document.getElementById('onboarding');
    if (localStorage.getItem('onboardingVisto') === 'true') { 
        if(onboarding) onboarding.style.display = 'none'; 
    }
    document.getElementById('btn-empezar')?.addEventListener('click', () => {
        if (window.speechSynthesis) {
            let vozMuda = new SpeechSynthesisUtterance('');
            vozMuda.volume = 0;
            window.speechSynthesis.speak(vozMuda);
        }
        onboarding.classList.add('oculto');
        localStorage.setItem('onboardingVisto', 'true'); 
        setTimeout(() => window.leerTextoSimple(`Bienvenida al Nivel ${AppState.state.nivelActual}. Toca cada sílaba para leer.`, 0.9), 300); 
        setTimeout(() => onboarding.style.display = 'none', 500);
    });

    document.getElementById('btn-leer-ui')?.addEventListener('click', (e) => {
        let targets = document.querySelectorAll('.meme-modal.active .leer-ui-target');
        let textoLeido = Array.from(targets).map(t => t.innerText).join('. ') || "Toca las sílabas iluminadas de izquierda a derecha para armar la frase.";
        e.target.classList.add('tts-activo');
        window.leerTextoSimple(textoLeido, 0.9);
        setTimeout(() => e.target.classList.remove('tts-activo'), 2000);
    });

    // --- PANEL ADMIN SECRETO (5 toques en el saludo) ---
    let adminTaps = 0;
    document.getElementById('admin-trigger')?.addEventListener('click', () => {
        adminTaps++;
        if(adminTaps >= 5) {
            cargarVoces();
            toggleModal(DOM.modales.admin, true);
            adminTaps = 0;
        }
        setTimeout(() => adminTaps = 0, 2500);
    });

    DOM.selectVozAdmin?.addEventListener('change', (e) => {
        AppState.update('vozPreferidaURI', e.target.value);
        window.leerTextoSimple("Hola, esta es mi nueva voz para practicar.", 0.9);
    });

    document.getElementById('btn-probar-voz')?.addEventListener('click', () => {
        window.leerTextoSimple("¡Qué chévere! Vas a aprender a leer súper rápido.", 0.9);
    });
    
    document.getElementById('btn-guardar-admin')?.addEventListener('click', () => {
        let rawPal = document.getElementById('admin-palabra').value.trim();
        let emo = document.getElementById('admin-emoji').value.trim();
        if(rawPal && emo) {
            const silabas = rawPal.includes('-') ? rawPal.toLowerCase().split('-') : [rawPal.toLowerCase()];
            const palabraLimpia = rawPal.replace(/-/g, '');
            const nuevaPalabra = {
                palabra: palabraLimpia.charAt(0).toUpperCase() + palabraLimpia.slice(1),
                silabas: silabas,
                correcta: true,
                nivel: AppState.state.nivelActual,
                icono: emo
            };
            const nuevoDic = [...AppState.state.dicAdmin, nuevaPalabra];
            AppState.update('dicAdmin', nuevoDic);
            window.mostrarMensaje("¡Palabra personalizada guardada!", "success");
            document.getElementById('admin-palabra').value = "";
            document.getElementById('admin-emoji').value = "";
        } else {
            window.mostrarMensaje("Completa la palabra y el emoji", "error");
        }
    });
    document.getElementById('btn-cerrar-admin')?.addEventListener('click', () => toggleModal(DOM.modales.admin, false));

    // --- EXPORTAR API PARA LOS MINIJUEGOS ---
    window.AppJuegosAPI = {
        estado: AppState,
        audio: AudioUI,
        dom: DOM,
        obtenerDiccionario: obtenerDiccionario,
        toggleModal: toggleModal,
        lanzarConfeti: lanzarConfeti,
        inicializarTarjetas: inicializarTarjetas,
        registrarPalabraDominada: function(palabra) {
            const actuales = AppState.state.palabrasDominadas;
            if (!actuales.includes(palabra)) {
                const nuevas = [...actuales, palabra];
                AppState.update('palabrasDominadas', nuevas);
                // Recompensa de Escudo cada 5 palabras dominadas
                if (nuevas.length % 5 === 0 && !AppState.state.tieneEscudo) {
                    AppState.update('tieneEscudo', true);
                    window.mostrarMensaje("¡Ganaste un Escudo Protector de Racha! 🛡️", "info");
                }
            }
        }
    };
});
