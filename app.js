// --- REGISTRO DEL SERVICE WORKER Y ACTUALIZACIÓN AUTOMÁTICA ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(reg => {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    reg.update();
                }
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

document.addEventListener('DOMContentLoaded', () => {
    // --- VARIABLES DEL DOM ---
    const feedContainer = document.getElementById('feed-container');
    const pointsDisplay = document.getElementById('points');
    const streakDisplay = document.getElementById('streak');
    const greetingDisplay = document.getElementById('greeting');
    const displayNivel = document.getElementById('display-nivel');
    const memeModal = document.getElementById('meme-modal');
    const memeImg = document.getElementById('meme-img');
    const onboarding = document.getElementById('onboarding');
    const btnEmpezar = document.getElementById('btn-empezar');
    const btnWsp = document.getElementById('btn-wsp');
    const btnHome = document.getElementById('btn-home');
    
    const storeModal = document.getElementById('store-modal');
    const btnPremios = document.getElementById('btn-premios');
    const btnCerrarTienda = document.getElementById('btn-cerrar-tienda');
    const storePointsDisplay = document.getElementById('store-points-display');
    const barraProgreso = document.getElementById('level-progress-bar');

    // Modal de Nivel
    const modalNivel = document.getElementById('modal-nivel');
    const btnSiNivel = document.getElementById('btn-si-nivel');
    const btnNoNivel = document.getElementById('btn-no-nivel');

    // --- AUDIOS ---
    const audioBocina = new Audio('audios/bocina.mp3');
    const audioVictoria = new Audio('audios/victoria.mp3'); 
    audioVictoria.volume = 0.5;
    
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playPop() {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.connect(gainNode); gainNode.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
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

    // --- ECONOMÍA Y NIVEL ---
    let points = parseInt(localStorage.getItem('misEstrellas')) || 20; 
    let streak = parseInt(localStorage.getItem('miRacha')) || 0;
    let nivelActual = parseInt(localStorage.getItem('miNivel')) || 1;
    let tieneEscudo = localStorage.getItem('tieneEscudo') === 'true';
    const hoy = new Date().toDateString();
    
    if (pointsDisplay) pointsDisplay.innerText = points;
    if (displayNivel) displayNivel.innerText = nivelActual;
    if (streakDisplay) streakDisplay.innerText = streak;
    
    function aplicarEstiloNivel(nivel) {
        const root = document.documentElement;
        if (nivel === 1) { root.style.setProperty('--accent-purple', '#bb86fc'); root.style.setProperty('--accent-coral', '#ff7f50'); }
        else if (nivel === 2) { root.style.setProperty('--accent-purple', '#00e676'); root.style.setProperty('--accent-coral', '#18ffff'); } 
        else if (nivel === 3) { root.style.setProperty('--accent-purple', '#ff9100'); root.style.setProperty('--accent-coral', '#ff1744'); } 
        else if (nivel >= 4) { root.style.setProperty('--accent-purple', '#d50000'); root.style.setProperty('--accent-coral', '#ffeb3b'); }
    }
    aplicarEstiloNivel(nivelActual);

    function actualizarBarraProgreso() {
        if(!barraProgreso) return;
        let totalTarjetas = document.querySelectorAll(`.card[data-nivel="${nivelActual}"]`).length;
        let completadas = document.querySelectorAll(`.card[data-nivel="${nivelActual}"].completada`).length;
        let porcentaje = totalTarjetas === 0 ? 0 : (completadas / totalTarjetas) * 100;
        barraProgreso.style.width = porcentaje + '%';
    }

    function modificarEstrellas(cantidad) {
        points += cantidad;
        if (points < 0) points = 0;
        localStorage.setItem('misEstrellas', points);
        if (pointsDisplay) pointsDisplay.innerText = points;
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
                        alert("¡Tu Escudo protegió tu racha de fuego! 🔥");
                        localStorage.setItem('tieneEscudo', 'false'); tieneEscudo = false;
                    } else { streak = 1; }
                }
            } else { streak = 1; }
            
            localStorage.setItem('ultimoIngresoLectura', hoy);
            localStorage.setItem('rachaActualizadaHoy', hoy);
            localStorage.setItem('miRacha', streak);
            if (streakDisplay) streakDisplay.innerText = streak;
        }
    }

    window.comprarPremio = function(costo, nombre, nivelRequerido) {
        if (nivelActual < nivelRequerido) return alert(`🔒 Necesitas el NIVEL ${nivelRequerido} para canjear esto.`);
        if (points >= costo) {
            modificarEstrellas(-costo);
            if (nombre === 'Escudo') localStorage.setItem('tieneEscudo', 'true');
            alert(`¡Compraste: ${nombre}! Dile a Piero que te lo pague.`);
            if (storePointsDisplay) storePointsDisplay.innerText = points;
        } else { alert("Faltan estrellas ⭐."); }
    };

    function hacerBotonHibrido(boton, textoGuia, funcionClick) {
        let timerPresion;
        let esPresionLarga = false;

        const iniciar = () => {
            esPresionLarga = false;
            boton.classList.add('leyendo-guia');
            timerPresion = setTimeout(() => {
                esPresionLarga = true;
                leerTextoSimple(textoGuia, 0.9);
            }, 500); 
        };

        const cancelar = () => {
            clearTimeout(timerPresion);
            boton.classList.remove('leyendo-guia');
        };

        boton.ontouchstart = (e) => { iniciar(); };
        boton.ontouchend = (e) => { 
            cancelar();
            if(!esPresionLarga) funcionClick(e);
            if(e.cancelable) e.preventDefault(); 
        };
        boton.onmousedown = (e) => { if(e.pointerType !== 'touch') iniciar(); };
        boton.onmouseup = (e) => { 
            if(e.pointerType !== 'touch') {
                cancelar();
                if(!esPresionLarga) funcionClick(e);
            }
        };
        boton.onmouseleave = cancelar;
    }
    
    hacerBotonHibrido(btnHome, "Botón de Inicio.", () => { feedContainer.scrollTo({top: 0, behavior: 'smooth'}); });
    hacerBotonHibrido(btnPremios, "Tienda de premios.", () => {
        if (storePointsDisplay) storePointsDisplay.innerText = points;
        storeModal.classList.remove('hidden'); setTimeout(() => storeModal.classList.add('active'), 10);
    });

    btnWsp.addEventListener('click', () => {
        let mensaje = `¡Hola Piero! Soy Nivel ${nivelActual} en Lee TikTok. Tengo ${points} ⭐ estrellas. ¡Págame mis premios! 😎`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`, '_blank');
    });

    if (localStorage.getItem('onboardingVisto') === 'true') {
        onboarding.style.display = 'none';
    }

    if (btnEmpezar) {
        btnEmpezar.addEventListener('click', () => {
            let vozMuda = new SpeechSynthesisUtterance('');
            vozMuda.volume = 0;
            window.speechSynthesis.speak(vozMuda);

            if (audioCtx.state === 'suspended') audioCtx.resume();

            onboarding.classList.add('oculto');
            localStorage.setItem('onboardingVisto', 'true'); 
            
            setTimeout(() => { leerTextoSimple(`Bienvenida al Nivel ${nivelActual}.`, 0.85); }, 300); 
            setTimeout(() => onboarding.style.display = 'none', 500);
        });
    }
    
    if (btnCerrarTienda) btnCerrarTienda.addEventListener('click', () => {
        storeModal.classList.remove('active'); setTimeout(() => storeModal.classList.add('hidden'), 300);
    });

    // --- LÓGICA DEL MODAL DE SUBIDA DE NIVEL Y EXAMEN ---
    if (btnSiNivel) {
        btnSiNivel.addEventListener('click', () => {
            modalNivel.classList.remove('active');
            setTimeout(() => {
                modalNivel.classList.add('hidden');
                iniciarExamenNivel();
            }, 300);
        });
    }

    if (btnNoNivel) {
        btnNoNivel.addEventListener('click', () => {
            modalNivel.classList.remove('active');
            setTimeout(() => {
                modalNivel.classList.add('hidden');
                
                if (!document.getElementById('tarjeta-pase-nivel')) {
                    const tarjetaPase = `
                        <section class="card" id="tarjeta-pase-nivel">
                            <div class="glass-content" style="border: 2px solid var(--accent-coral);">
                                <h2 style="font-size: 1.8rem; margin-bottom: 10px;">¡Nivel ${nivelActual} Dominado! 🏆</h2>
                                <p style="color: var(--text-dim); margin: 15px 0;">Cuando sientas que estás lista, aprueba el examen final para avanzar.</p>
                                <button class="start-btn" id="btn-pase-manual" style="width: 100%; margin: 0;">Dar Examen de Nivel 📝</button>
                            </div>
                        </section>
                    `;
                    feedContainer.insertAdjacentHTML('beforeend', tarjetaPase);
                    
                    setTimeout(() => {
                        const btnPaseManual = document.getElementById('btn-pase-manual');
                        if (btnPaseManual) {
                            btnPaseManual.addEventListener('click', () => {
                                iniciarExamenNivel();
                            });
                        }
                        btnPaseManual.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                }
            }, 300);
        });
    }

    // --- MOTOR DE VOZ BLINDADO ---
    let vocesDisponibles = [];
    window.utterances = []; 

    if (window.speechSynthesis) {
        vocesDisponibles = window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => vocesDisponibles = window.speechSynthesis.getVoices();
    }

    function obtenerMejorVoz() {
        if (!window.speechSynthesis) return null;
        if (vocesDisponibles.length === 0) vocesDisponibles = window.speechSynthesis.getVoices();
        
        const vozLatina = vocesDisponibles.find(v => v.lang === 'es-US' || v.lang === 'es-MX' || v.lang === 'es-419' || v.lang === 'es-PE');
        const vozEsp = vocesDisponibles.find(v => v.lang.startsWith('es'));
        return vozLatina || vozEsp || vocesDisponibles[0];
    }

    function purgarMotorDeVoz() {
        window.speechSynthesis.cancel();
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
    }

    window.leerTextoSimple = function(texto, velocidad = 0.8) {
        if (!window.speechSynthesis) return;
        purgarMotorDeVoz(); 
        
        setTimeout(() => { 
            const utterance = new SpeechSynthesisUtterance(texto.replace(/-/g, ''));
            window.utterances.push(utterance);

            const vozSeleccionada = obtenerMejorVoz();
            if (vozSeleccionada) {
                utterance.voice = vozSeleccionada;
                utterance.lang = vozSeleccionada.lang; 
            }
            utterance.rate = velocidad; 
            utterance.pitch = 1.1; 
            
            utterance.onend = () => { window.utterances = window.utterances.filter(u => u !== utterance); };
            utterance.onerror = () => { window.utterances = window.utterances.filter(u => u !== utterance); };

            window.speechSynthesis.speak(utterance);
            window.speechSynthesis.resume(); 
        }, 50);
    };

    function leerFraseConResaltado(texto, cardHtml, velocidad = 0.85) {
        return new Promise((resolve) => {
            if (!window.speechSynthesis) return resolve();
            purgarMotorDeVoz();

            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(texto.replace(/-/g, ''));
                window.utterances.push(utterance);

                const vozSeleccionada = obtenerMejorVoz();
                if (vozSeleccionada) {
                    utterance.voice = vozSeleccionada;
                    utterance.lang = vozSeleccionada.lang; 
                }
                utterance.rate = velocidad; 
                utterance.pitch = 1.1;

                const spansPalabra = cardHtml.querySelectorAll('.palabra');
                let indexActivo = 0;

                utterance.onboundary = (event) => {
                    if (event.name === 'word') {
                        spansPalabra.forEach(s => s.classList.remove('word-highlight'));
                        if (spansPalabra[indexActivo]) {
                            spansPalabra[indexActivo].classList.add('word-highlight');
                            indexActivo++;
                        }
                    }
                };

                utterance.onend = () => {
                    spansPalabra.forEach(s => s.classList.remove('word-highlight'));
                    window.utterances = window.utterances.filter(u => u !== utterance); 
                    resolve(); 
                };
                
                utterance.onerror = () => {
                    window.utterances = window.utterances.filter(u => u !== utterance); 
                    resolve();
                };

                window.speechSynthesis.speak(utterance);
                window.speechSynthesis.resume(); 
            }, 50);
        });
    }

    window.leerSilaba = function(elementoHtml, silaba) {
        playPop(); 

        const diccionarioFonetico = {
            "to": "tó", "te": "té", "se": "sé", "de": "dé", "tu": "tú", "mi": "mí", "si": "sí", "el": "él",
            "be": "bé", "ge": "jé", "que": "ké", "qui": "kí", "crush": "crash", "pov": "pof",
            "ju": "jú", "jo": "jó", "ja": "já", "je": "jé", "ji": "jí",
            "go": "gó", "gu": "gú", "ga": "gá", "gi": "jí", "no": "nó", "me": "mé", "su": "sú", "yo": "yó"
        };
        
        let silabaAudio = diccionarioFonetico[silaba.toLowerCase()] || silaba;
        
        const leerSilabaPromesa = new Promise((resolve) => {
            if (!window.speechSynthesis) return resolve();
            
            purgarMotorDeVoz();
            
            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(silabaAudio + ".");
                window.utterances.push(utterance);

                const vozSeleccionada = obtenerMejorVoz();
                if (vozSeleccionada) {
                    utterance.voice = vozSeleccionada;
                    utterance.lang = vozSeleccionada.lang;
                }
                utterance.rate = 0.6; 
                utterance.pitch = 1.1;
                
                utterance.onend = () => {
                    window.utterances = window.utterances.filter(u => u !== utterance);
                    resolve();
                };
                utterance.onerror = () => {
                    window.utterances = window.utterances.filter(u => u !== utterance);
                    resolve();
                };
                
                window.speechSynthesis.speak(utterance);
                window.speechSynthesis.resume();
            }, 20);
        });
        
        if (elementoHtml.classList.contains('no-leida')) {
            elementoHtml.classList.remove('no-leida');
            elementoHtml.classList.add('leida');
            elementoHtml.style.color = 'var(--accent-coral)'; 
            
            let card = elementoHtml.closest('.card');
            let silabasFaltantes = card.querySelectorAll('.no-leida');
            
            if (silabasFaltantes.length === 0 && !card.classList.contains('completada')) {
                card.classList.add('completada'); 
                modificarEstrellas(5); 
                registrarRachaPorLectura(); 
                actualizarBarraProgreso(); 
                lanzarConfeti(); 
                audioVictoria.play(); 
                
                let btnContenedor = card.querySelector('.glass-content');
                const fraseCompleta = btnContenedor.getAttribute('data-texto');

                setTimeout(() => {
                    leerFraseConResaltado(fraseCompleta, card, 0.85).then(() => {
                        verificarSubidaDeNivel(card);
                    });
                }, 600); 

                let oldBtn = btnContenedor.querySelector('.full-phrase-btn');
                if (oldBtn) {
                    oldBtn.outerHTML = '<button class="play-trigger repetir-btn"><div class="play-icon" style="font-size: 1.1rem;">🔁 Volver a escuchar</div></button>';
                    let newBtn = btnContenedor.querySelector('.repetir-btn');
                    newBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation(); 
                        const frase = btnContenedor.getAttribute('data-texto'); 
                        leerFraseConResaltado(frase, card, 0.85); 
                    });
                }
            }
        }
    };

    function verificarSubidaDeNivel(card) {
        let nivelDeEstaTarjeta = parseInt(card.getAttribute('data-nivel'));
        if (nivelDeEstaTarjeta === nivelActual) {
            let totalTarjetasDelNivel = document.querySelectorAll(`.card[data-nivel="${nivelActual}"]`);
            let completadas = document.querySelectorAll(`.card[data-nivel="${nivelActual}"].completada`);
            
            if (totalTarjetasDelNivel.length === completadas.length) {
                if (document.getElementById('tarjeta-pase-nivel')) return;

                setTimeout(() => {
                    if (modalNivel) {
                        modalNivel.classList.remove('hidden');
                        setTimeout(() => modalNivel.classList.add('active'), 10);
                        playPop(); 
                    }
                }, 800); 
            }
        }
    }

    function transicionSuaveNivel() {
        feedContainer.classList.add('fade-out');
        setTimeout(() => {
            feedContainer.innerHTML = '';
            if (displayNivel) displayNivel.innerText = nivelActual;
            aplicarEstiloNivel(nivelActual);
            inicializarTarjetas();
            feedContainer.scrollTo(0,0);
            feedContainer.classList.remove('fade-out');
            feedContainer.classList.add('fade-in');
            setTimeout(() => { feedContainer.classList.remove('fade-in'); }, 500);
        }, 500); 
    }

    function inicializarTarjetas() {
        if (typeof frasesDatos === 'undefined') return;
        let datosFiltrados = frasesDatos.filter(item => item.nivel === nivelActual);
        
        if (datosFiltrados.length === 0) {
            feedContainer.innerHTML = `<div class="card"><div class="glass-content"><h2>¡Juego Terminado!</h2><p>Eres una maestra. Nivel máximo alcanzado.</p></div></div>`;
            barraProgreso.style.width = '100%';
            return;
        }

        let datosMezclados = datosFiltrados.sort(() => Math.random() - 0.5);
        datosMezclados.forEach(item => crearTarjeta(item));
        activarBotonesVoz();
        actualizarBarraProgreso(); 
    }
    
    inicializarTarjetas(); 

    function crearTarjeta(item) {
        let textoBadge = 'Nivel ' + item.nivel;
        let palabrasArray = item.texto.split(' ');
        let htmlProcesado = '';

        palabrasArray.forEach(palabra => {
            let silabasArray = palabra.split('-'); 
            htmlProcesado += `<span class="palabra">`;
            silabasArray.forEach((silaba, index) => {
                htmlProcesado += `<span class="silaba no-leida" onclick="leerSilaba(this, '${silaba}')">${silaba}</span>`;
                if(index < silabasArray.length - 1) htmlProcesado += `<span class="guion">-</span>`;
            });
            htmlProcesado += `</span><span class="espacio"> </span>`;
        });

        const tarjetaHTML = `
            <section class="card" data-nivel="${item.nivel}">
                <div class="glass-content" data-texto="${item.texto}">
                    <div class="badge">${textoBadge}</div>
                    <p class="reading-text">${htmlProcesado}</p>
                    <button class="play-trigger full-phrase-btn" title="Ayuda">
                        <div class="play-icon" style="font-size: 1.2rem;">${item.iconoBoton} Ayuda (-2 ⭐)</div>
                    </button>
                </div>
            </section>
        `;
        feedContainer.innerHTML += tarjetaHTML;
    }

    function activarBotonesVoz() {
        document.querySelectorAll('.full-phrase-btn').forEach(button => {
            hacerBotonHibrido(button, "Este es el botón de ayuda. Te resta 2 estrellas, pero te lee la frase completa.", (e) => {
                if (points < 2) return alert("Faltan estrellas ⭐. ¡Toca las sílabas!");
                
                audioBocina.play();
                modificarEstrellas(-2); 
                mostrarMeme('memes/error.jpg');
                
                const card = button.closest('.card');
                const cardContent = button.closest('.glass-content');
                const textoFrase = cardContent.getAttribute('data-texto');
                card.classList.add('completada'); 
                
                let btnContenedor = card.querySelector('.glass-content');
                let oldBtn = btnContenedor.querySelector('.full-phrase-btn');

                if (oldBtn) {
                    oldBtn.outerHTML = '<button class="play-trigger repetir-btn"><div class="play-icon" style="font-size: 1.1rem;">🔁 Volver a escuchar</div></button>';
                    let newBtn = btnContenedor.querySelector('.repetir-btn');
                    newBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        leerFraseConResaltado(textoFrase, card, 0.85); 
                    });
                }

                card.querySelectorAll('.no-leida').forEach(el => {
                    el.classList.remove('no-leida');
                    el.classList.add('leida');
                    el.style.color = 'var(--accent-coral)';
                });

                actualizarBarraProgreso();

                audioBocina.onended = () => { 
                    leerFraseConResaltado(textoFrase, card, 0.85).then(() => {
                        verificarSubidaDeNivel(card);
                    }); 
                };
            });
        });
    }

    function mostrarMeme(rutaImagen) {
        if(memeImg) {
            memeImg.src = rutaImagen; memeModal.classList.remove('hidden');
            setTimeout(() => memeModal.classList.add('active'), 50);
            setTimeout(() => { memeModal.classList.remove('active'); setTimeout(() => memeModal.classList.add('hidden'), 300); }, 1800);
        }
    }

    // --- BASE DE DATOS GLOBAL CORREGIDA Y AMPLIADA ---
    const diccionarioJuegos = [
        { palabra: "Mamá", correcta: true, nivel: 1, icono: "👩‍👧" },
        { palabra: "Mepa", correcta: false, nivel: 1 },
        { palabra: "Papá", correcta: true, nivel: 1, icono: "👨‍👧" },
        { palabra: "Pupo", correcta: false, nivel: 1 },
        { palabra: "Pato", correcta: true, nivel: 1, icono: "🦆" },
        { palabra: "Tepo", correcta: false, nivel: 1 },
        { palabra: "Silla", correcta: true, nivel: 1, icono: "🪑" }, // Corregido: Silla
        { palabra: "Mesa", correcta: true, nivel: 1, icono: "🍽️" },  // Nueva opción: Mesa
        { palabra: "Mesu", correcta: false, nivel: 1 },
        { palabra: "Sapo", correcta: true, nivel: 1, icono: "🐸" },
        { palabra: "Sopu", correcta: false, nivel: 1 },
        { palabra: "Luna", correcta: true, nivel: 1, icono: "🌙" },
        { palabra: "Linu", correcta: false, nivel: 1 },
        { palabra: "Dado", correcta: true, nivel: 1, icono: "🎲" },
        { palabra: "Dudo", correcta: true, nivel: 1 }, 
        { palabra: "Dapu", correcta: false, nivel: 1 },
        { palabra: "Casa", correcta: true, nivel: 1, icono: "🏠" },
        { palabra: "Coso", correcta: false, nivel: 1 },
        { palabra: "Moto", correcta: true, nivel: 2, icono: "🏍️" },
        { palabra: "Muta", correcta: false, nivel: 2 },
        { palabra: "Reloj", correcta: true, nivel: 2, icono: "⌚" },
        { palabra: "Gato", correcta: true, nivel: 2, icono: "🐈" },
        { palabra: "Guti", correcta: false, nivel: 2 },
        { palabra: "Perro", correcta: true, nivel: 2, icono: "🐕" },
        { palabra: "Purro", correcta: false, nivel: 2 },
        { palabra: "Pelota", correcta: true, nivel: 2, icono: "⚽" },
        { palabra: "Peluto", correcta: false, nivel: 2 },
        { palabra: "Jugo", correcta: true, nivel: 2, icono: "🧃" },
        { palabra: "Jago", correcta: false, nivel: 2 },
        { palabra: "Celular", correcta: true, nivel: 3, icono: "📱" },
        { palabra: "Cilular", correcta: false, nivel: 3 },
        { palabra: "Ceviche", correcta: true, nivel: 3, icono: "🐟🍋" },
        { palabra: "Cevocho", correcta: false, nivel: 3 },
        { palabra: "Helado", correcta: true, nivel: 3, icono: "🍦" },
        { palabra: "Holado", correcta: false, nivel: 3 },
        { palabra: "Zapatilla", correcta: true, nivel: 3, icono: "👟" },
        { palabra: "Zapotilla", correcta: false, nivel: 3 },
        { palabra: "Tiktok", correcta: true, nivel: 4, icono: "📱🎵" },
        { palabra: "Tiktek", correcta: false, nivel: 4 },
        { palabra: "Yape", correcta: true, nivel: 4, icono: "💸" },
        { palabra: "Yepa", correcta: false, nivel: 4 },
        { palabra: "Crush", correcta: true, nivel: 4, icono: "😍" },
        { palabra: "Crosh", correcta: false, nivel: 4 }
    ];

    // --- LÓGICA DE MEMORIA PARA MINIJUEGOS ---
    let palabrasDominadas = JSON.parse(localStorage.getItem('palabrasDominadas')) || [];

    // --- LÓGICA DEL MINIJUEGO SWIPE ---
    const minijuegoModal = document.getElementById('minijuego-modal');
    const tarjetaSwipe = document.getElementById('tarjeta-swipe');
    const palabraSwipe = document.getElementById('palabra-swipe');
    const btnCerrarMinijuego = document.getElementById('btn-cerrar-minijuego');
    const btnJugar = document.getElementById('btn-jugar');

    let palabraActualJuego = null;

    function cargarNuevaPalabraSwipe() {
        // Filtramos para evitar repetir las palabras dominadas
        let palabrasDisponibles = diccionarioJuegos.filter(p => p.nivel <= nivelActual && !palabrasDominadas.includes(p.palabra));
        
        // Si ya dominó todo, reiniciamos el ciclo para repasar
        if (palabrasDisponibles.length === 0) {
            palabrasDominadas = []; 
            localStorage.setItem('palabrasDominadas', JSON.stringify(palabrasDominadas));
            palabrasDisponibles = diccionarioJuegos.filter(p => p.nivel <= nivelActual);
        }
        
        palabraActualJuego = palabrasDisponibles[Math.floor(Math.random() * palabrasDisponibles.length)];
        palabraSwipe.innerText = palabraActualJuego.palabra;
    }

    if (minijuegoModal && tarjetaSwipe) {
        let toqueInicialX = 0;
        let toqueActualX = 0;

        tarjetaSwipe.addEventListener('touchstart', (e) => {
            toqueInicialX = e.changedTouches[0].screenX;
            tarjetaSwipe.style.transition = 'none'; 
        });

        tarjetaSwipe.addEventListener('touchmove', (e) => {
            toqueActualX = e.changedTouches[0].screenX;
            let diferenciaX = toqueActualX - toqueInicialX;
            let rotacion = diferenciaX * 0.08; 
            tarjetaSwipe.style.transform = `translate3d(${diferenciaX}px, 0, 0) rotate(${rotacion}deg)`;
        });

        tarjetaSwipe.addEventListener('touchend', (e) => {
            let toqueFinalX = e.changedTouches[0].screenX;
            let diferenciaX = toqueFinalX - toqueInicialX;
            tarjetaSwipe.style.transition = 'transform 0.3s ease, opacity 0.3s ease'; 

            if (diferenciaX > 100) {
                tarjetaSwipe.style.transform = `translate3d(500px, 0, 0) rotate(30deg)`;
                tarjetaSwipe.style.opacity = '0';
                evaluarPalabraSwipe(true);
            } else if (diferenciaX < -100) {
                tarjetaSwipe.style.transform = `translate3d(-500px, 0, 0) rotate(-30deg)`;
                tarjetaSwipe.style.opacity = '0';
                evaluarPalabraSwipe(false);
            } else {
                tarjetaSwipe.style.transform = `translate3d(0px, 0, 0) rotate(0deg)`;
            }
        });

        function evaluarPalabraSwipe(esDerecha) {
            let acerto = (esDerecha === palabraActualJuego.correcta);

            if (acerto) {
                playPop(); 
                modificarEstrellas(1); 
                lanzarConfeti(); 
                
                // Guardar como dominada en el momento que se acierta
                if (!palabrasDominadas.includes(palabraActualJuego.palabra)) {
                    palabrasDominadas.push(palabraActualJuego.palabra);
                    localStorage.setItem('palabrasDominadas', JSON.stringify(palabrasDominadas));
                }
            } else {
                let audioErrorJuego = new Audio('audios/bocina.mp3');
                audioErrorJuego.play(); 
                tarjetaSwipe.classList.add('error-shake');
                minijuegoModal.classList.add('flash-rojo');
                if (navigator.vibrate) navigator.vibrate([50, 50, 50, 50, 50]); 
            }

            setTimeout(() => {
                tarjetaSwipe.style.transition = 'none';
                tarjetaSwipe.style.transform = `translate3d(0px, 0, 0) rotate(0deg)`; 
                tarjetaSwipe.style.opacity = '1';
                tarjetaSwipe.classList.remove('error-shake');
                minijuegoModal.classList.remove('flash-rojo');
                cargarNuevaPalabraSwipe(); 
            }, 400);
        }

        if (btnCerrarMinijuego) {
            btnCerrarMinijuego.addEventListener('click', () => {
                minijuegoModal.classList.remove('active');
                setTimeout(() => minijuegoModal.classList.add('hidden'), 300);
            });
        }
    }

    if (btnJugar && minijuegoModal) {
        btnJugar.addEventListener('click', () => {
            minijuegoModal.classList.remove('hidden');
            setTimeout(() => minijuegoModal.classList.add('active'), 10);
            cargarNuevaPalabraSwipe(); 
            leerTextoSimple("Desliza a la derecha si es una palabra real, o a la izquierda si es una palabra inventada.", 0.9);
        });
    }

    // --- LÓGICA DEL MINIJUEGO DE ESCRITURA Y MODO EXAMEN ---
    const modalEscritura = document.getElementById('minijuego-escritura');
    const btnEscribir = document.getElementById('btn-escribir');
    const btnCerrarEscritura = document.getElementById('btn-cerrar-escritura');
    const imagenLeer = document.getElementById('imagen-leer'); 
    const inputEscritura = document.getElementById('input-escritura');
    const btnVerificar = document.getElementById('btn-verificar-escritura');
    const btnEscucharPalabra = document.getElementById('btn-escuchar-palabra');
    const tarjetaEscritura = document.getElementById('tarjeta-escritura');

    let palabraObjetivo = "";
    let modoExamen = false;
    let examenPalabras = [];
    let examenIndice = 0;

    window.iniciarExamenNivel = function() {
        let palabrasValidas = diccionarioJuegos.filter(p => p.nivel === nivelActual && p.correcta === true && p.icono);
        if (palabrasValidas.length === 0) palabrasValidas = diccionarioJuegos.filter(p => p.correcta === true && p.icono);
        
        palabrasValidas = palabrasValidas.sort(() => Math.random() - 0.5);
        examenPalabras = palabrasValidas.slice(0, 3); 
        examenIndice = 0;
        modoExamen = true;

        if (modalEscritura) {
            modalEscritura.classList.remove('hidden');
            setTimeout(() => modalEscritura.classList.add('active'), 10);
            cargarPalabraEscrituraExamen();
            leerTextoSimple(`Examen final. Escribe las tres palabras correctamente para pasar de nivel.`, 0.9);
        }
    };

    function cargarPalabraEscrituraExamen() {
        let seleccion = examenPalabras[examenIndice];
        palabraObjetivo = seleccion.palabra;
        if(imagenLeer) imagenLeer.innerText = seleccion.icono; 
        
        if(inputEscritura) {
            inputEscritura.value = ""; 
            inputEscritura.focus();
        }
        
        const tituloModal = document.querySelector('#minijuego-escritura h2');
        if(tituloModal) tituloModal.innerText = `Examen Nivel ${nivelActual} 📝 (${examenIndice + 1}/${examenPalabras.length})`;
    }

    function cargarPalabraEscritura() {
        modoExamen = false;
        const tituloModal = document.querySelector('#minijuego-escritura h2');
        if(tituloModal) tituloModal.innerText = "¿Qué ves aquí?";

        // Evitar que se repitan las palabras ya escritas correctamente
        let palabrasValidas = diccionarioJuegos.filter(p => p.nivel <= nivelActual && p.correcta === true && p.icono && !palabrasDominadas.includes(p.palabra));
        
        if (palabrasValidas.length === 0) {
            palabrasDominadas = [];
            localStorage.setItem('palabrasDominadas', JSON.stringify(palabrasDominadas));
            palabrasValidas = diccionarioJuegos.filter(p => p.correcta === true && p.icono);
        }
        
        let seleccion = palabrasValidas[Math.floor(Math.random() * palabrasValidas.length)];
        palabraObjetivo = seleccion.palabra;
        if(imagenLeer) imagenLeer.innerText = seleccion.icono; 
        
        if(inputEscritura) {
            inputEscritura.value = ""; 
            inputEscritura.focus();
        }
    }

    if (btnEscribir && modalEscritura) {
        btnEscribir.addEventListener('click', () => {
            modalEscritura.classList.remove('hidden');
            setTimeout(() => modalEscritura.classList.add('active'), 10);
            cargarPalabraEscritura();
            leerTextoSimple("Mira el dibujo y escribe la palabra en la caja de abajo.", 0.9);
        });

        btnCerrarEscritura.addEventListener('click', () => {
            if (modoExamen) {
                alert("Has cancelado el examen. Puedes intentarlo luego usando la tarjeta dorada al final de la lista.");
                modoExamen = false;
            }
            modalEscritura.classList.remove('active');
            setTimeout(() => modalEscritura.classList.add('hidden'), 300);
        });

        btnEscucharPalabra.addEventListener('click', () => {
            leerTextoSimple(palabraObjetivo, 0.8);
        });

        function validarEscritura() {
            let textoIngresado = inputEscritura.value.trim().toLowerCase();
            let textoReal = palabraObjetivo.toLowerCase();

            let ingresadoLimpio = textoIngresado.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let realLimpio = textoReal.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            if (ingresadoLimpio === realLimpio && ingresadoLimpio !== "") {
                playPop();
                modificarEstrellas(2); 
                lanzarConfeti();
                
                // Guardar la palabra escrita para no repetirla, solo si no es examen
                if (!modoExamen && !palabrasDominadas.includes(palabraObjetivo)) {
                    palabrasDominadas.push(palabraObjetivo);
                    localStorage.setItem('palabrasDominadas', JSON.stringify(palabrasDominadas));
                }
                
                inputEscritura.style.backgroundColor = 'rgba(0, 230, 118, 0.2)'; 
                
                setTimeout(() => {
                    inputEscritura.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
                    
                    if (modoExamen) {
                        examenIndice++;
                        if (examenIndice < examenPalabras.length) {
                            cargarPalabraEscrituraExamen();
                        } else {
                            modoExamen = false;
                            modalEscritura.classList.remove('active');
                            setTimeout(() => {
                                modalEscritura.classList.add('hidden');
                                nivelActual++;
                                localStorage.setItem('miNivel', nivelActual);
                                alert(`¡EXAMEN APROBADO! 🎉\nDemostraste que ya dominas estas palabras. ¡Bienvenida al Nivel ${nivelActual}!`);
                                transicionSuaveNivel();
                            }, 300);
                        }
                    } else {
                        cargarPalabraEscritura();
                    }
                }, 800);
            } else {
                let audioErrorEscribir = new Audio('audios/bocina.mp3');
                audioErrorEscribir.play();
                
                tarjetaEscritura.classList.add('error-shake');
                modalEscritura.classList.add('flash-rojo');
                if (navigator.vibrate) navigator.vibrate([50, 50, 50]); 
                
                setTimeout(() => {
                    tarjetaEscritura.classList.remove('error-shake');
                    modalEscritura.classList.remove('flash-rojo');
                    inputEscritura.focus();
                }, 400);
            }
        }

        btnVerificar.addEventListener('click', validarEscritura);

        inputEscritura.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                inputEscritura.blur(); 
                validarEscritura();
            }
        });
    }
});
