// --- REGISTRO DEL SERVICE WORKER Y ACTUALIZACIÓN AUTOMÁTICA ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(reg => {
            // Revisa si hay código nuevo cada vez que ella minimiza y vuelve a abrir la app
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    reg.update();
                }
            });
        }).catch(err => console.error('SW Error:', err));
    });

    // Cuando detecta que el nuevo Service Worker tomó el control, recarga la app sola
    let refrescando = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refrescando) {
            window.location.reload();
            refrescando = true;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
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

    // --- AUDIOS ---
    const audioBocina = new Audio('audios/bocina.mp3');
    const audioVictoria = new Audio('audios/victoria.mp3'); 
    audioVictoria.volume = 0.5; // Baja el volumen a la mitad para que la voz resalte
    
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

    // --- EFECTO VISUAL ---
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
        if (nivel === 2) { root.style.setProperty('--accent-purple', '#00e676'); root.style.setProperty('--accent-coral', '#18ffff'); } 
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

    let toquesReset = 0, timerReset;
    greetingDisplay.addEventListener('click', () => {
        toquesReset++; clearTimeout(timerReset);
        timerReset = setTimeout(() => { toquesReset = 0; }, 2000); 
        if (toquesReset >= 5) {
            if (confirm("⚠️ MODO DESARROLLADOR: ¿Volver al Nivel 1 y borrar progreso?")) {
                localStorage.clear(); location.reload();
            }
            toquesReset = 0;
        }
    });

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
        } else { alert("Faltan estrellas ⭐."); }
    };

    // --- EL NUEVO BOTÓN HÍBRIDO ---
    function hacerBotonHibrido(boton, textoGuia, funcionClick) {
        let timerPresion;
        let esPresionLarga = false;

        const iniciar = () => {
            esPresionLarga = false;
            boton.classList.add('leyendo-guia');
            timerPresion = setTimeout(() => {
                esPresionLarga = true;
                leerTexto(textoGuia, 0.9);
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
    
    hacerBotonHibrido(btnHome, "Botón de Inicio.", () => { /* Trampas eliminadas */ });

    hacerBotonHibrido(btnPremios, "Tienda de premios. Canjea tus estrellas aquí.", () => {
        if (storePointsDisplay) storePointsDisplay.innerText = points;
        storeModal.classList.remove('hidden'); setTimeout(() => storeModal.classList.add('active'), 10);
    });

    btnWsp.addEventListener('click', () => {
        let mensaje = `¡Hola Piero! Soy Nivel ${nivelActual} en Lee TikTok. Tengo ${points} ⭐ estrellas. ¡Págame mis premios! 😎`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`, '_blank');
    });

    if (btnEmpezar) btnEmpezar.addEventListener('click', () => {
        onboarding.classList.add('oculto');
        leerTexto(`Bienvenida al Nivel ${nivelActual}.`, 0.85); 
    });
    
    if (btnCerrarTienda) btnCerrarTienda.addEventListener('click', () => {
        storeModal.classList.remove('active'); setTimeout(() => storeModal.classList.add('hidden'), 300);
    });

    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) greetingDisplay.innerText = "¡Buenos días! ☀️";
    else if (hora >= 12 && hora < 19) greetingDisplay.innerText = "¡Buenas tardes! 🌆";
    else greetingDisplay.innerText = "¡Buenas noches! 🌙";

    // --- MOTOR DE VOZ (CON ESCUDO ANTI-ATASCOS) ---
    let vocesDisponibles = [];
    if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = () => vocesDisponibles = window.speechSynthesis.getVoices();

    function obtenerMejorVoz() {
        if (!window.speechSynthesis) return null;
        if (vocesDisponibles.length === 0) vocesDisponibles = window.speechSynthesis.getVoices();
        const voces = vocesDisponibles.filter(v => v.lang.startsWith('es'));
        const nombresFemeninos = ['helena', 'sabina', 'paulina', 'zira', 'hilda', 'pilar', 'juana', 'google'];
        return voces.find(v => nombresFemeninos.some(n => v.name.toLowerCase().includes(n))) || voces[0];
    }

    window.leerTexto = function(texto, velocidad = 0.8) {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel(); 
        
        setTimeout(() => { 
            const utterance = new SpeechSynthesisUtterance(texto.replace(/-/g, ' '));
            utterance.voice = obtenerMejorVoz();
            utterance.lang = 'es-PE'; utterance.rate = velocidad; utterance.pitch = 1.1; 
            window.speechSynthesis.speak(utterance);
        }, 50);
    };

    window.leerSilaba = function(elementoHtml, silaba) {
        playPop(); 

        const diccionarioFonetico = {
            "to": "tó", "te": "té", "se": "sé", "de": "dé", "tu": "tú", "mi": "mí", "si": "sí", "el": "él",
            "be": "bé", "ge": "jé", "que": "ké", "qui": "kí", "crush": "crash", "pov": "pof",
            "ju": "jú", "jo": "jó", "ja": "já", "je": "jé", "ji": "jí",
            "go": "gó", "gu": "gú", "ga": "gá", "gi": "jí", "no": "nó", "me": "mé", "su": "sú", "yo": "yó"
        };
        
        let silabaAudio = diccionarioFonetico[silaba.toLowerCase()] || silaba;
        leerTexto(silabaAudio + ".", 0.6); 
        
        if (elementoHtml.classList.contains('no-leida')) {
            elementoHtml.classList.remove('no-leida');
            elementoHtml.classList.add('leida');
            elementoHtml.style.color = 'var(--accent-coral)'; 
            
            let card = elementoHtml.closest('.card');
            let silabasFaltantes = card.querySelectorAll('.no-leida');
            
            // --- SI COMPLETÓ LA FRASE ---
            if (silabasFaltantes.length === 0 && !card.classList.contains('completada')) {
                card.classList.add('completada'); 
                modificarEstrellas(5); 
                registrarRachaPorLectura(); 
                actualizarBarraProgreso(); 
                
                audioVictoria.play(); 
                lanzarConfeti(); 

                // FIX 1: LECTURA INMEDIATA DE LA FRASE (No esperar para evitar bloqueo)
                const fraseCompleta = card.getAttribute('data-texto');
                leerTexto(fraseCompleta, 0.85);

                // FIX 2: CREAR BOTÓN DE REPETIR BLINDADO
                let btnContenedor = card.querySelector('.glass-content');
                let oldBtn = btnContenedor.querySelector('.full-phrase-btn');
                if(oldBtn) {
                    oldBtn.innerHTML = '<div class="play-icon" style="font-size: 1.1rem;">🔁 Volver a escuchar</div>';
                    oldBtn.className = 'play-trigger repetir-btn'; 
                    let newBtn = oldBtn.cloneNode(true);
                    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
                    
                    // Asignación directa y blindada del evento clic
                    newBtn.onclick = function(e) {
                        e.preventDefault();
                        leerTexto(fraseCompleta, 0.85); 
                    };
                }

                let nivelDeEstaTarjeta = parseInt(card.getAttribute('data-nivel'));
                if (nivelDeEstaTarjeta === nivelActual) {
                    let totalTarjetasDelNivel = document.querySelectorAll(`.card[data-nivel="${nivelActual}"]`);
                    let completadas = document.querySelectorAll(`.card[data-nivel="${nivelActual}"].completada`);
                    if (totalTarjetasDelNivel.length === completadas.length) {
                        nivelActual++;
                        localStorage.setItem('miNivel', nivelActual);
                        setTimeout(() => {
                            alert(`¡FELICIDADES! 🎉\nDesbloqueaste el NIVEL ${nivelActual}.`);
                            location.reload(); 
                        }, 3500); 
                    }
                }
            }
        }
    };

    function inicializarTarjetas() {
        if (typeof frasesDatos === 'undefined') return;
        let datosFiltrados = frasesDatos.filter(item => item.nivel === nivelActual);
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
                    <button class="play-trigger full-phrase-btn" title="Manten presionado para escuchar qué hace este botón">
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
                
                const cardContent = button.closest('.glass-content');
                const textoFrase = cardContent.getAttribute('data-texto');
                button.closest('.card').classList.add('completada'); 
                actualizarBarraProgreso();

                audioBocina.onended = () => { leerTexto(textoFrase, 0.85); };
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
});
