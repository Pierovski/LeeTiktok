document.addEventListener('DOMContentLoaded', () => {
    const api = window.AppJuegosAPI;
    if (!api) return;

    // ==========================================
    // 1. MINIJUEGO SWIPE (CON GESTO Y BOTONES)
    // ==========================================
    let palabraActualSwipe = null;
    let rondaSwipe = 1;
    const tarjetaSwipe = document.getElementById('tarjeta-swipe');

    document.getElementById('btn-abrir-swipe')?.addEventListener('click', () => {
        api.toggleModal(api.dom.modales.menuJuegos, false);
        api.toggleModal(api.dom.modales.swipe, true);
        rondaSwipe = 1;
        cargarPalabraSwipe();
    });

    function cargarPalabraSwipe() {
        const dic = api.obtenerDiccionario();
        const nivel = api.estado.state.nivelActual;
        
        let disp = dic.filter(p => p.nivel <= nivel);
        if (disp.length === 0) disp = dic;

        palabraActualSwipe = disp[Math.floor(Math.random() * disp.length)];
        document.getElementById('palabra-swipe').innerText = palabraActualSwipe.palabra;
        document.querySelector('#titulo-swipe').innerText = `Ronda ${rondaSwipe}: ¿Existe esta palabra?`;
        window.leerTextoSimple(palabraActualSwipe.palabra, 0.85);
    }

    if(tarjetaSwipe) {
        let tIni = 0;
        tarjetaSwipe.addEventListener('touchstart', (e) => {
            tIni = e.changedTouches[0].screenX;
            tarjetaSwipe.style.transition = 'none';
        }, {passive: true});

        tarjetaSwipe.addEventListener('touchmove', (e) => {
            let dif = e.changedTouches[0].screenX - tIni;
            tarjetaSwipe.style.transform = `translate3d(${dif}px, 0, 0) rotate(${dif * 0.08}deg)`;
        }, {passive: true});

        tarjetaSwipe.addEventListener('touchend', (e) => {
            let dif = e.changedTouches[0].screenX - tIni;
            tarjetaSwipe.style.transition = 'transform 0.3s, opacity 0.3s'; 
            if (dif > 90) {
                animarSalidaSwipe(true);
            } else if (dif < -90) {
                animarSalidaSwipe(false);
            } else {
                tarjetaSwipe.style.transform = `translate3d(0, 0, 0) rotate(0deg)`;
            }
        });
    }

    function animarSalidaSwipe(esDerecha) {
        if (!tarjetaSwipe) return;
        tarjetaSwipe.style.transition = 'transform 0.3s, opacity 0.3s';
        const dir = esDerecha ? 400 : -400;
        const rot = esDerecha ? 25 : -25;
        tarjetaSwipe.style.transform = `translate3d(${dir}px, 0, 0) rotate(${rot}deg)`;
        tarjetaSwipe.style.opacity = '0';
        evaluarSwipe(esDerecha);
    }

    document.getElementById('btn-swipe-falsa')?.addEventListener('click', () => animarSalidaSwipe(false));
    document.getElementById('btn-swipe-real')?.addEventListener('click', () => animarSalidaSwipe(true));

    function evaluarSwipe(esDerecha) {
        if (!palabraActualSwipe) return;
        if (esDerecha === palabraActualSwipe.correcta) {
            api.audio.playVictoria();
            window.mostrarMensaje(palabraActualSwipe.correcta ? `¡Sí! "${palabraActualSwipe.palabra}" es real ${palabraActualSwipe.icono || ''}` : "¡Bien visto! Esa palabra no existe", "success");
            if (palabraActualSwipe.correcta) api.registrarPalabraDominada(palabraActualSwipe.palabra);
            rondaSwipe++;
        } else {
            api.audio.playError();
            tarjetaSwipe.classList.add('error-shake'); 
            api.dom.modales.swipe.classList.add('flash-rojo');
            window.mostrarMensaje(palabraActualSwipe.correcta ? `"${palabraActualSwipe.palabra}" sí existe ${palabraActualSwipe.icono || ''}` : `"${palabraActualSwipe.palabra}" es una palabra inventada`, "error");
        }
        
        setTimeout(() => {
            tarjetaSwipe.style.transition = 'none';
            tarjetaSwipe.style.transform = `translate3d(0, 0, 0) rotate(0deg)`;
            tarjetaSwipe.style.opacity = '1';
            tarjetaSwipe.classList.remove('error-shake');
            api.dom.modales.swipe.classList.remove('flash-rojo');
            cargarPalabraSwipe(); 
        }, 700);
    }
    document.getElementById('btn-cerrar-minijuego')?.addEventListener('click', () => api.toggleModal(api.dom.modales.swipe, false));

    // ==========================================
    // 2. MINIJUEGO SONIDOS Y LETRAS (SIN SPOILER VISUAL)
    // ==========================================
    let itemLetraObjetivo = null;
    let rondaLetras = 1;
    
    document.getElementById('btn-abrir-letras')?.addEventListener('click', () => {
        api.toggleModal(api.dom.modales.menuJuegos, false);
        api.toggleModal(api.dom.modales.letras, true);
        rondaLetras = 1;
        generarOpcionesLetras();
    });

    function generarOpcionesLetras() {
        const pool = typeof fonemasLetras !== 'undefined' ? fonemasLetras : [{ letra: "M", audio: "Sonido mmm, como en mamá", pista: "✋ Mamá, Mano" }];
        const cont = document.getElementById('contenedor-opciones-letras');
        let ops = [];
        while(ops.length < 4 && ops.length < pool.length) { 
            let r = pool[Math.floor(Math.random() * pool.length)]; 
            if(!ops.some(x => x.letra === r.letra)) ops.push(r); 
        }
        itemLetraObjetivo = ops[Math.floor(Math.random() * ops.length)];
        
        // No mostramos la letra en el título para que practique discriminación auditiva real
        document.getElementById('titulo-letras').innerText = `Ronda ${rondaLetras}: Escucha y elige`;
        document.getElementById('pista-letras').innerText = itemLetraObjetivo.pista;

        cont.innerHTML = ops.map(item => 
            `<button class="btn-letra-opcion" data-letra="${item.letra}" style="background: rgba(255,255,255,0.05); border: 2px solid rgba(187,134,252,0.5); color: white; font-size: 2.5rem; font-weight: bold; padding: 20px; border-radius: 20px; cursor: pointer; transition: all 0.2s;">${item.letra}</button>`
        ).join('');

        cont.onclick = (e) => {
            const btn = e.target.closest('.btn-letra-opcion');
            if(!btn) return;
            if(btn.dataset.letra === itemLetraObjetivo.letra) {
                api.audio.playVictoria();
                btn.style.backgroundColor = 'rgba(0, 230, 118, 0.4)';
                btn.style.borderColor = '#00e676';
                rondaLetras++;
                setTimeout(generarOpcionesLetras, 850);
            } else {
                api.audio.playError();
                btn.classList.add('error-shake');
                btn.style.backgroundColor = 'rgba(255, 23, 68, 0.4)';
                btn.style.borderColor = '#ff1744';
                setTimeout(() => {
                    btn.classList.remove('error-shake');
                    btn.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    btn.style.borderColor = 'rgba(187,134,252,0.5)';
                }, 450);
            }
        };
        window.leerTextoSimple(itemLetraObjetivo.audio, 0.85);
    }
    document.getElementById('btn-escuchar-letra-juego')?.addEventListener('click', () => {
        if (itemLetraObjetivo) window.leerTextoSimple(itemLetraObjetivo.audio, 0.82);
    });
    document.getElementById('btn-cerrar-letras')?.addEventListener('click', () => api.toggleModal(api.dom.modales.letras, false));

    // ==========================================
    // 3. MINIJUEGO CAZADOR DE SÍLABAS
    // ==========================================
    let silabaObjetivo = "";
    let rondaSilabas = 1;

    document.getElementById('btn-abrir-silabas')?.addEventListener('click', () => {
        api.toggleModal(api.dom.modales.menuJuegos, false);
        api.toggleModal(api.dom.modales.silabas, true);
        rondaSilabas = 1;
        generarOpcionesSilabas();
    });

    function pronunciarSilabaClara(sil) {
        const mapa = {
            "ma": "maa", "me": "mee", "mi": "mii", "mo": "moo",
            "pa": "paa", "pe": "pee", "pi": "pii", "po": "poo",
            "sa": "saa", "se": "see", "si": "sii", "so": "soo",
            "la": "laa", "le": "lee", "li": "lii", "lo": "loo",
            "ta": "taa", "te": "tee", "ti": "tii", "to": "too",
            "ra": "raa", "re": "ree", "ri": "rii", "ro": "roo",
            "va": "baa", "ve": "bee", "vi": "bii", "da": "daa", "de": "dee", "di": "dii"
        };
        return mapa[sil] || sil;
    }

    function generarOpcionesSilabas() {
        const nivel = api.estado.state.nivelActual;
        let poolSilabas = ["ma", "me", "mi", "mo", "pa", "pe", "pi", "po", "sa", "se", "si", "so", "la", "le", "li", "lo", "ta", "te", "ti", "to"];
        if (nivel >= 2) poolSilabas = poolSilabas.concat(["pan", "sol", "mar", "luz", "cel", "pal", "can", "fies"]);
        if (nivel >= 3) poolSilabas = poolSilabas.concat(["bra", "bre", "cra", "cre", "gra", "gre", "pla", "ple", "tra", "tre"]);

        const cont = document.getElementById('contenedor-opciones-silabas');
        let ops = [];
        while(ops.length < 4) {
            let r = poolSilabas[Math.floor(Math.random() * poolSilabas.length)];
            if(!ops.includes(r)) ops.push(r);
        }
        silabaObjetivo = ops[Math.floor(Math.random() * ops.length)];
        document.getElementById('titulo-silabas').innerText = `Ronda ${rondaSilabas}: ¿Dónde suena así?`;

        cont.innerHTML = ops.map(s =>
            `<button class="btn-silaba-opcion" data-silaba="${s}" style="background: rgba(255,255,255,0.05); border: 2px solid rgba(187,134,252,0.5); color: white; font-size: 2.3rem; font-weight: bold; padding: 20px; border-radius: 20px; cursor: pointer; transition: all 0.2s;">${s}</button>`
        ).join('');

        cont.onclick = (e) => {
            const btn = e.target.closest('.btn-silaba-opcion');
            if(!btn) return;

            if(btn.dataset.silaba === silabaObjetivo) {
                api.audio.playVictoria();
                btn.style.backgroundColor = 'rgba(0, 230, 118, 0.4)';
                btn.style.borderColor = '#00e676';
                rondaSilabas++;
                setTimeout(generarOpcionesSilabas, 850);
            } else {
                api.audio.playError();
                btn.classList.add('error-shake');
                btn.style.backgroundColor = 'rgba(255, 23, 68, 0.4)';
                btn.style.borderColor = '#ff1744';
                setTimeout(() => {
                    btn.classList.remove('error-shake');
                    btn.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    btn.style.borderColor = 'rgba(187,134,252,0.5)';
                }, 450);
            }
        };

        window.leerTextoSimple(`Busca la sílaba: ${pronunciarSilabaClara(silabaObjetivo)}`, 0.84);
    }

    document.getElementById('btn-escuchar-silaba-juego')?.addEventListener('click', () => {
        window.leerTextoSimple(`Sílaba: ${pronunciarSilabaClara(silabaObjetivo)}`, 0.8);
    });
    document.getElementById('btn-cerrar-silabas')?.addEventListener('click', () => api.toggleModal(api.dom.modales.silabas, false));

    // ==========================================
    // 4. MEMORAMA
    // ==========================================
    let memoVolteadas = [], aciertosMemo = 0, rondaMemorama = 1;
    
    document.getElementById('btn-abrir-memorama')?.addEventListener('click', () => {
        api.toggleModal(api.dom.modales.menuJuegos, false);
        api.toggleModal(api.dom.modales.memorama, true);
        rondaMemorama = 1;
        iniciarMemorama();
    });

    function iniciarMemorama() {
        document.querySelector('#ronda-memorama').innerText = `Ronda ${rondaMemorama}`;
        const dic = api.obtenerDiccionario();
        const nivel = api.estado.state.nivelActual;
        
        let validas = dic.filter(p => p.correcta && p.icono && p.nivel <= nivel);
        if(validas.length < 4) validas = dic.filter(p => p.correcta && p.icono);

        let seleccion = [...validas].sort(() => 0.5 - Math.random()).slice(0, 4); 
        let memoCartas = [];
        seleccion.forEach(s => {
            memoCartas.push({ val: s.palabra, id: s.palabra, esTexto: true });
            memoCartas.push({ val: s.icono, id: s.palabra, esTexto: false });
        });
        memoCartas.sort(() => 0.5 - Math.random());
        
        aciertosMemo = 0;
        memoVolteadas = [];
        const grid = document.getElementById('grid-memorama');
        grid.innerHTML = memoCartas.map(c => `<div class="carta-memo carta-oculta" data-id="${c.id}" data-texto="${c.esTexto}">${c.val}</div>`).join('');
        
        grid.onclick = (e) => {
            let c = e.target.closest('.carta-memo');
            if(!c || !c.classList.contains('carta-oculta') || memoVolteadas.length >= 2) return;
            
            c.classList.remove('carta-oculta');
            if (c.dataset.texto === 'true') window.leerTextoSimple(c.dataset.id, 0.88);
            memoVolteadas.push(c);
            
            if(memoVolteadas.length === 2) {
                if(memoVolteadas[0].dataset.id === memoVolteadas[1].dataset.id) {
                    api.audio.playVictoria();
                    aciertosMemo++; 
                    memoVolteadas[0].classList.add('carta-match');
                    memoVolteadas[1].classList.add('carta-match'); 
                    api.registrarPalabraDominada(memoVolteadas[0].dataset.id);
                    memoVolteadas = [];
                    
                    if(aciertosMemo === 4) {
                        api.lanzarConfeti();
                        window.mostrarMensaje("¡Tablero dominado!", "success");
                        rondaMemorama++;
                        setTimeout(iniciarMemorama, 1400); 
                    }
                } else {
                    api.audio.playError();
                    setTimeout(() => {
                        memoVolteadas[0].classList.add('carta-oculta');
                        memoVolteadas[1].classList.add('carta-oculta');
                        memoVolteadas = [];
                    }, 950);
                }
            }
        };
    }
    document.getElementById('btn-cerrar-memorama')?.addEventListener('click', () => api.toggleModal(api.dom.modales.memorama, false));

    // ==========================================
    // 5. CONSTRUCTOR DE ORACIONES
    // ==========================================
    let oracionObjetivo = [];
    let fraseCompletaAudio = "";
    let rondaOraciones = 1;
    
    document.getElementById('btn-abrir-oraciones')?.addEventListener('click', () => {
        api.toggleModal(api.dom.modales.menuJuegos, false);
        api.toggleModal(api.dom.modales.oraciones, true);
        rondaOraciones = 1;
        iniciarOracion();
    });

    function iniciarOracion() {
        document.querySelector('#titulo-oraciones').innerText = `Ronda ${rondaOraciones}: Ordena la frase`;
        const nivel = api.estado.state.nivelActual;
        
        let frasesDisponibles = frasesDatos.filter(f => f.nivel <= nivel);
        if(frasesDisponibles.length === 0) frasesDisponibles = frasesDatos;

        let fraseObj = frasesDisponibles[Math.floor(Math.random() * frasesDisponibles.length)];
        fraseCompletaAudio = fraseObj.texto.replace(/-/g, '');
        oracionObjetivo = fraseCompletaAudio.split(' ');
        
        let bloquesAleatorios = [...oracionObjetivo].sort(() => 0.5 - Math.random());
        const zonaConstruccion = document.getElementById('zona-construccion');
        const zonaBloques = document.getElementById('zona-bloques');
        
        zonaConstruccion.innerHTML = '';
        zonaBloques.innerHTML = bloquesAleatorios.map(b => `<div class="bloque-palabra">${b}</div>`).join('');
        
        zonaBloques.onclick = (e) => {
            if(e.target.classList.contains('bloque-palabra')) {
                window.leerTextoSimple(e.target.innerText, 0.88);
                zonaConstruccion.appendChild(e.target);
            }
        };
        zonaConstruccion.onclick = (e) => {
            if(e.target.classList.contains('bloque-palabra')) {
                zonaBloques.appendChild(e.target);
            }
        };
        window.leerTextoSimple(fraseCompletaAudio, 0.88);
    }

    document.getElementById('btn-escuchar-oracion')?.addEventListener('click', () => {
        if (fraseCompletaAudio) window.leerTextoSimple(fraseCompletaAudio, 0.86);
    });

    document.getElementById('btn-verificar-oracion')?.addEventListener('click', () => {
        let construida = Array.from(document.getElementById('zona-construccion').children).map(c => c.innerText);
        if(construida.join(' ') === oracionObjetivo.join(' ')) {
            api.audio.playVictoria();
            window.mostrarMensaje("¡Oración perfecta!", "success");
            window.leerTextoSimple(fraseCompletaAudio, 0.92);
            rondaOraciones++;
            setTimeout(iniciarOracion, 1200);
        } else {
            api.audio.playError();
            const zonaCons = document.getElementById('zona-construccion');
            zonaCons.classList.add('error-shake');
            setTimeout(() => zonaCons.classList.remove('error-shake'), 400);
        }
    });
    document.getElementById('btn-cerrar-oraciones')?.addEventListener('click', () => api.toggleModal(api.dom.modales.oraciones, false));

    // ==========================================
    // 6. ARMA Y ESCRIBE (ANDAMIAJE SÍLABAS EN N1/N2 + TECLADO EN N3/N4)
    // ==========================================
    const inputEscritura = document.getElementById('input-escritura');
    const contenedorModoBloques = document.getElementById('escritura-modo-bloques');
    const respBloques = document.getElementById('escritura-respuesta-bloques');
    const opcBloques = document.getElementById('escritura-opciones-bloques');
    const btnMic = document.getElementById('btn-dictar-voz');

    let itemObjetivoEscritura = null;
    let rondaEscritura = 1;

    function normalizarTexto(txt) {
        return (txt || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function armarUIporSilabas(itemPalabra, contenedorRespuesta, contenedorOpciones) {
        contenedorRespuesta.innerHTML = '';
        const silabasReales = itemPalabra.silabas || [itemPalabra.palabra.toLowerCase()];
        const distractoresPool = ["ma", "pa", "sa", "la", "to", "lu", "pe", "ro", "ta", "mi"];
        let distractores = distractoresPool.filter(d => !silabasReales.includes(d)).sort(() => 0.5 - Math.random()).slice(0, 2);
        let todasOpciones = [...silabasReales, ...distractores].sort(() => 0.5 - Math.random());

        contenedorOpciones.innerHTML = todasOpciones.map(s => `<div class="bloque-palabra">${s}</div>`).join('');

        contenedorOpciones.onclick = (e) => {
            if (e.target.classList.contains('bloque-palabra')) {
                window.leerTextoSimple(pronunciarSilabaClara(e.target.innerText), 0.85);
                contenedorRespuesta.appendChild(e.target);
            }
        };
        contenedorRespuesta.onclick = (e) => {
            if (e.target.classList.contains('bloque-palabra')) {
                contenedorOpciones.appendChild(e.target);
            }
        };
    }

    document.getElementById('btn-abrir-escritura')?.addEventListener('click', () => {
        api.toggleModal(api.dom.modales.menuJuegos, false);
        api.toggleModal(api.dom.modales.escritura, true);
        rondaEscritura = 1;
        iniciarEscritura();
    });

    function iniciarEscritura() {
        const nivel = api.estado.state.nivelActual;
        document.querySelector('#titulo-escritura').innerText = nivel <= 2
            ? `Ronda ${rondaEscritura}: Toca las sílabas`
            : `Ronda ${rondaEscritura}: Escribe la palabra`;

        const dic = api.obtenerDiccionario();
        let disp = dic.filter(p => p.correcta && p.nivel <= nivel && p.icono);
        if(disp.length === 0) disp = dic.filter(p => p.correcta && p.icono);

        itemObjetivoEscritura = disp[Math.floor(Math.random() * disp.length)];
        document.getElementById('imagen-leer').innerText = itemObjetivoEscritura.icono || '❓';
        inputEscritura.value = "";

        // Ocultar micrófono si está offline
        if (btnMic) {
            btnMic.style.display = navigator.onLine ? 'inline-flex' : 'none';
        }

        if (nivel <= 2) {
            contenedorModoBloques.classList.remove('hidden');
            inputEscritura.classList.add('hidden');
            armarUIporSilabas(itemObjetivoEscritura, respBloques, opcBloques);
        } else {
            contenedorModoBloques.classList.add('hidden');
            inputEscritura.classList.remove('hidden');
        }
        window.leerTextoSimple(itemObjetivoEscritura.palabra, 0.86);
    }

    document.getElementById('btn-escuchar-palabra')?.addEventListener('click', () => {
        if (itemObjetivoEscritura) window.leerTextoSimple(itemObjetivoEscritura.palabra, 0.84);
    });
    
    btnMic?.addEventListener('click', (e) => {
        if (!navigator.onLine) {
            return window.mostrarMensaje("El micrófono necesita internet. ¡Ármala con los botones!", "info");
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return window.mostrarMensaje("Micrófono no soportado en este navegador.", "error");
        const reco = new SpeechRecognition();
        reco.lang = 'es-PE';
        reco.onstart = () => { e.target.style.background = 'rgba(255,23,68,0.4)'; };
        reco.onresult = (ev) => {
            const dicho = ev.results[0][0].transcript;
            inputEscritura.value = dicho;
            verificarRespuestaEscritura(dicho);
        };
        reco.onend = () => { e.target.style.background = 'rgba(0,230,118,0.2)'; };
        reco.start();
    });

    function verificarRespuestaEscritura(forzarTexto = null) {
        if (!itemObjetivoEscritura) return;
        const nivel = api.estado.state.nivelActual;
        let respuestaUsuario = "";

        if (forzarTexto !== null) {
            respuestaUsuario = forzarTexto;
        } else if (nivel <= 2) {
            respuestaUsuario = Array.from(respBloques.children).map(c => c.innerText).join('');
        } else {
            respuestaUsuario = inputEscritura.value;
        }

        if (normalizarTexto(respuestaUsuario) === normalizarTexto(itemObjetivoEscritura.palabra)) {
            api.audio.playVictoria();
            window.mostrarMensaje(`¡Excelente! "${itemObjetivoEscritura.palabra}"`, "success");
            api.registrarPalabraDominada(itemObjetivoEscritura.palabra);
            rondaEscritura++;
            setTimeout(iniciarEscritura, 1000);
        } else {
            api.audio.playError();
            const targetShake = nivel <= 2 ? respBloques : inputEscritura;
            targetShake.classList.add('error-shake');
            setTimeout(() => targetShake.classList.remove('error-shake'), 400);
        }
    }

    document.getElementById('btn-verificar-escritura')?.addEventListener('click', () => verificarRespuestaEscritura());
    document.getElementById('btn-cerrar-escritura')?.addEventListener('click', () => api.toggleModal(api.dom.modales.escritura, false));

    // ==========================================
    // 7. RETO DE NIVEL (3 CORAZONES ❤️❤️❤️, SIN RELOJ ESTRESANTE)
    // ==========================================
    let vidasJefe = 3;
    let aciertosJefe = 0;
    let itemActualJefe = null;
    const examenModoBloques = document.getElementById('examen-modo-bloques');
    const examenRespBloques = document.getElementById('examen-respuesta-bloques');
    const examenOpcBloques = document.getElementById('examen-opciones-bloques');
    const inputExamen = document.getElementById('input-examen');

    document.getElementById('btn-si-nivel')?.addEventListener('click', () => {
        api.toggleModal(api.dom.modales.nivel, false);
        setTimeout(iniciarRetoNivel, 300);
    });

    function actualizarHUDJefe() {
        document.getElementById('progreso-jefe').innerText = `Palabra ${aciertosJefe + 1} de 3`;
        document.getElementById('vidas-jefe').innerText = "❤️".repeat(vidasJefe) + "🖤".repeat(3 - vidasJefe);
    }

    function cargarPalabraJefe() {
        const dic = api.obtenerDiccionario();
        const nivel = api.estado.state.nivelActual;
        let validas = dic.filter(p => p.correcta && p.icono && p.nivel <= nivel);
        if (validas.length === 0) validas = dic.filter(p => p.correcta && p.icono);

        itemActualJefe = validas[Math.floor(Math.random() * validas.length)];
        document.getElementById('imagen-examen').innerText = itemActualJefe.icono || '❓';
        inputExamen.value = "";
        actualizarHUDJefe();

        if (nivel <= 2) {
            examenModoBloques.classList.remove('hidden');
            inputExamen.classList.add('hidden');
            armarUIporSilabas(itemActualJefe, examenRespBloques, examenOpcBloques);
        } else {
            examenModoBloques.classList.add('hidden');
            inputExamen.classList.remove('hidden');
        }
        window.leerTextoSimple(itemActualJefe.palabra, 0.85);
    }

    function iniciarRetoNivel() {
        vidasJefe = 3;
        aciertosJefe = 0;
        api.toggleModal(api.dom.modales.examen, true);
        document.getElementById('examen-nivel-texto').innerText = api.estado.state.nivelActual;
        cargarPalabraJefe();
    }

    document.getElementById('btn-audio-examen')?.addEventListener('click', () => {
        if (itemActualJefe) window.leerTextoSimple(itemActualJefe.palabra, 0.82);
    });

    document.getElementById('btn-verificar-examen')?.addEventListener('click', () => {
        if (!itemActualJefe) return;
        const nivel = api.estado.state.nivelActual;
        let resp = nivel <= 2
            ? Array.from(examenRespBloques.children).map(c => c.innerText).join('')
            : inputExamen.value;

        if (normalizarTexto(resp) === normalizarTexto(itemActualJefe.palabra)) {
            api.audio.playVictoria();
            api.registrarPalabraDominada(itemActualJefe.palabra);
            aciertosJefe++;

            if (aciertosJefe >= 3) {
                const nuevoNivel = Math.min(4, api.estado.state.nivelActual + 1);
                api.estado.update('nivelActual', nuevoNivel);
                api.lanzarConfeti();
                window.mostrarMensaje(`¡Reto superado! Desbloqueaste el Nivel ${nuevoNivel} 🏆`, "success");
                api.toggleModal(api.dom.modales.examen, false);
                setTimeout(() => api.inicializarTarjetas(), 600);
            } else {
                window.mostrarMensaje("¡Muy bien! Vamos por la siguiente", "success");
                setTimeout(cargarPalabraJefe, 800);
            }
        } else {
            vidasJefe--;
            api.audio.playError();
            actualizarHUDJefe();
            const tarjeta = document.getElementById('tarjeta-examen');
            tarjeta.classList.add('error-shake');
            setTimeout(() => tarjeta.classList.remove('error-shake'), 400);

            if (vidasJefe <= 0) {
                window.mostrarMensaje("Se acabaron los corazones. ¡Respira y vuelve a intentarlo cuando quieras!", "info");
                api.toggleModal(api.dom.modales.examen, false);
            } else {
                window.leerTextoSimple(`Escucha con calma: ${itemActualJefe.palabra}`, 0.8);
            }
        }
    });

    document.getElementById('btn-salir-examen')?.addEventListener('click', () => {
        api.toggleModal(api.dom.modales.examen, false);
    });
});
