document.addEventListener('DOMContentLoaded', () => {
    const api = window.AppJuegosAPI;
    if (!api) return;

    function pronunciarSilaba(sil) {
        if (window.convertirSilabaAFonetica) {
            window.leerTextoSimple(window.convertirSilabaAFonetica(sil), 0.85);
        } else {
            window.leerTextoSimple(sil, 0.85);
        }
    }

    function normalizarTexto(txt) {
        return (txt || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // =========================================================================
    // 1. MINIJUEGO SWIPE: DISCRIMINACIÓN VISUAL CON EMOJI + SÍLABAS (SIN SPOILER)
    // =========================================================================
    let palabraActualSwipe = null;
    let rondaSwipe = 1;
    let evaluandoSwipe = false;
    const tarjetaSwipe = document.getElementById('tarjeta-swipe');

    document.getElementById('btn-abrir-swipe')?.addEventListener('click', () => {
        api.toggleModal(api.dom.modales.menuJuegos, false);
        api.toggleModal(api.dom.modales.swipe, true);
        rondaSwipe = 1;
        cargarPalabraSwipe();
    });

    function cargarPalabraSwipe() {
        evaluandoSwipe = false;
        const dic = api.obtenerDiccionario();
        const nivel = api.estado.state.nivelActual;
        
        let disp = dic.filter(p => p.nivel <= nivel);
        if (disp.length === 0) disp = dic;

        palabraActualSwipe = disp[Math.floor(Math.random() * disp.length)];
        const silabasTexto = palabraActualSwipe.silabas ? palabraActualSwipe.silabas.join(' - ') : palabraActualSwipe.palabra;
        const iconoMostrar = palabraActualSwipe.icono || '🔎';

        document.getElementById('palabra-swipe').innerHTML = `
            <div style="font-size: 4.2rem; margin-bottom: 12px;">${iconoMostrar}</div>
            <div style="font-size: 2.2rem; color: white; letter-spacing: 1px;">${silabasTexto}</div>
            <div style="font-size: 0.9rem; color: var(--text-dim); margin-top: 10px; font-weight: normal;">(${palabraActualSwipe.palabra})</div>
            <button id="btn-audio-swipe" class="icon-circle-btn" style="margin-top: 15px; width: 44px; height: 44px; font-size: 1.1rem;" title="Escuchar cómo suena">🔊</button>
        `;
        document.querySelector('#titulo-swipe').innerText = `Ronda ${rondaSwipe}: ¿Está bien escrita?`;

        document.getElementById('btn-audio-swipe')?.addEventListener('click', (e) => {
            e.stopPropagation();
            window.leerTextoSimple(palabraActualSwipe.palabra, 0.85);
        });
    }

    if(tarjetaSwipe) {
        let tIni = 0;
        tarjetaSwipe.addEventListener('touchstart', (e) => {
            if (evaluandoSwipe || e.target.id === 'btn-audio-swipe') return;
            tIni = e.changedTouches[0].screenX;
            tarjetaSwipe.style.transition = 'none';
        }, {passive: true});

        tarjetaSwipe.addEventListener('touchmove', (e) => {
            if (evaluandoSwipe || !tIni) return;
            let dif = e.changedTouches[0].screenX - tIni;
            tarjetaSwipe.style.transform = `translate3d(${dif}px, 0, 0) rotate(${dif * 0.06}deg)`;
        }, {passive: true});

        tarjetaSwipe.addEventListener('touchend', (e) => {
            if (evaluandoSwipe || !tIni) return;
            let dif = e.changedTouches[0].screenX - tIni;
            tIni = 0;
            if (dif > 85) animarSalidaSwipe(true);
            else if (dif < -85) animarSalidaSwipe(false);
            else {
                tarjetaSwipe.style.transition = 'transform 0.25s';
                tarjetaSwipe.style.transform = `translate3d(0, 0, 0) rotate(0deg)`;
            }
        });
    }

    function animarSalidaSwipe(esDerecha) {
        if (!tarjetaSwipe || evaluandoSwipe) return;
        evaluandoSwipe = true;
        tarjetaSwipe.style.transition = 'transform 0.3s, opacity 0.3s';
        const dir = esDerecha ? 380 : -380;
        const rot = esDerecha ? 20 : -20;
        tarjetaSwipe.style.transform = `translate3d(${dir}px, 0, 0) rotate(${rot}deg)`;
        tarjetaSwipe.style.opacity = '0';
        evaluarSwipe(esDerecha);
    }

    document.getElementById('btn-swipe-falsa')?.addEventListener('click', () => animarSalidaSwipe(false));
    document.getElementById('btn-swipe-real')?.addEventListener('click', () => animarSalidaSwipe(true));

    function evaluarSwipe(esDerecha) {
        if (!palabraActualSwipe) return;
        const acierto = (esDerecha === palabraActualSwipe.correcta);

        if (acierto) {
            api.audio.playVictoria();
            if (palabraActualSwipe.correcta) {
                window.mostrarMensaje(`¡Correcto! Se escribe "${palabraActualSwipe.palabra}"`, "success");
                window.leerTextoSimple(palabraActualSwipe.palabra, 0.88);
                api.registrarPalabraDominada(palabraActualSwipe.palabra);
            } else {
                const correccion = palabraActualSwipe.realRef ? ` (Lo correcto es ${palabraActualSwipe.realRef})` : '';
                window.mostrarMensaje(`¡Muy bien! "${palabraActualSwipe.palabra}" es falsa${correccion}`, "success");
            }
            rondaSwipe++;
        } else {
            api.audio.playError();
            tarjetaSwipe.classList.add('error-shake'); 
            api.dom.modales.swipe.classList.add('flash-rojo');
            if (palabraActualSwipe.correcta) {
                window.mostrarMensaje(`¡Ups! "${palabraActualSwipe.palabra}" sí existe`, "error");
                window.leerTextoSimple(palabraActualSwipe.palabra, 0.85);
            } else {
                const correccion = palabraActualSwipe.realRef ? `Se escribe "${palabraActualSwipe.realRef}"` : 'No existe';
                window.mostrarMensaje(`"${palabraActualSwipe.palabra}" está mal escrita. ${correccion}`, "error");
            }
        }
        
        setTimeout(() => {
            tarjetaSwipe.style.transition = 'none';
            tarjetaSwipe.style.transform = `translate3d(0, 0, 0) rotate(0deg)`;
            tarjetaSwipe.style.opacity = '1';
            tarjetaSwipe.classList.remove('error-shake');
            api.dom.modales.swipe.classList.remove('flash-rojo');
            cargarPalabraSwipe(); 
        }, 1100);
    }
    document.getElementById('btn-cerrar-minijuego')?.addEventListener('click', () => api.toggleModal(api.dom.modales.swipe, false));

    // =========================================================================
    // 2. SONIDOS Y LETRAS: FAMILIA SILÁBICA CON DESFILE INTERACTIVO AL ACERTAR
    // =========================================================================
    let itemLetraObjetivo = null;
    let rondaLetras = 1;
    let bloqueadoLetras = false;
    
    document.getElementById('btn-abrir-letras')?.addEventListener('click', () => {
        api.toggleModal(api.dom.modales.menuJuegos, false);
        api.toggleModal(api.dom.modales.letras, true);
        rondaLetras = 1;
        generarOpcionesLetras();
    });

    function generarOpcionesLetras() {
        bloqueadoLetras = false;
        const pool = typeof fonemasLetras !== 'undefined' ? fonemasLetras : [];
        const cont = document.getElementById('contenedor-opciones-letras');
        let ops = [];
        while(ops.length < 4 && ops.length < pool.length) { 
            let r = pool[Math.floor(Math.random() * pool.length)]; 
            if(!ops.some(x => x.letra === r.letra)) ops.push(r); 
        }
        itemLetraObjetivo = ops[Math.floor(Math.random() * ops.length)];
        
        document.getElementById('titulo-letras').innerText = `Ronda ${rondaLetras}: ¿Qué letra suena así?`;
        document.getElementById('pista-letras').innerHTML = `<span style="color: var(--accent-coral); font-weight: bold;">${itemLetraObjetivo.pista}</span>`;

        cont.innerHTML = ops.map(item => 
            `<button class="btn-letra-opcion" data-letra="${item.letra}">${item.letra}</button>`
        ).join('');

        cont.onclick = (e) => {
            if (bloqueadoLetras) return;
            const btn = e.target.closest('.btn-letra-opcion');
            if(!btn) return;

            if(btn.dataset.letra === itemLetraObjetivo.letra) {
                bloqueadoLetras = true;
                api.audio.playVictoria();
                btn.style.backgroundColor = 'rgba(0, 230, 118, 0.35)';
                btn.style.borderColor = '#00e676';

                // Mostramos las sílabas de esa letra para reforzar la unión consonante+vocal
                if (itemLetraObjetivo.familia && itemLetraObjetivo.familia.length > 1) {
                    document.getElementById('pista-letras').innerHTML = itemLetraObjetivo.familia
                        .map(s => `<span class="chip-familia">${s}</span>`).join(' ');
                }
                rondaLetras++;
                setTimeout(generarOpcionesLetras, 1200);
            } else {
                api.audio.playError();
                btn.classList.add('error-shake');
                btn.style.backgroundColor = 'rgba(255, 23, 68, 0.35)';
                btn.style.borderColor = '#ff1744';
                setTimeout(() => {
                    btn.classList.remove('error-shake');
                    btn.style.backgroundColor = '';
                    btn.style.borderColor = '';
                }, 450);
            }
        };
        window.leerTextoSimple(itemLetraObjetivo.audio, 0.88);
    }

    document.getElementById('btn-escuchar-letra-juego')?.addEventListener('click', () => {
        if (itemLetraObjetivo) window.leerTextoSimple(itemLetraObjetivo.audio, 0.85);
    });
    document.getElementById('btn-cerrar-letras')?.addEventListener('click', () => api.toggleModal(api.dom.modales.letras, false));

    // =========================================================================
    // 3. CAZADOR DE SÍLABAS: COMPLETA LA SÍLABA QUE FALTA EN LA PALABRA REAL
    // =========================================================================
    let silabaObjetivo = "";
    let palabraContextoSilaba = null;
    let rondaSilabas = 1;
    let bloqueadoSilabas = false;

    document.getElementById('btn-abrir-silabas')?.addEventListener('click', () => {
        api.toggleModal(api.dom.modales.menuJuegos, false);
        api.toggleModal(api.dom.modales.silabas, true);
        rondaSilabas = 1;
        generarOpcionesSilabas();
    });

    function generarOpcionesSilabas() {
        bloqueadoSilabas = false;
        const nivel = api.estado.state.nivelActual;
        const dic = api.obtenerDiccionario().filter(p => p.correcta && p.silabas && p.silabas.length >= 2 && p.nivel <= nivel);
        const poolPalabras = dic.length ? dic : api.obtenerDiccionario().filter(p => p.correcta && p.silabas);

        palabraContextoSilaba = poolPalabras[Math.floor(Math.random() * poolPalabras.length)];
        const idxHueco = Math.floor(Math.random() * palabraContextoSilaba.silabas.length);
        silabaObjetivo = palabraContextoSilaba.silabas[idxHueco].toLowerCase();

        // Construimos la vista con el hueco: ej. "[ __ ] - to"
        const htmlPalabraIncompleta = palabraContextoSilaba.silabas.map((s, idx) => 
            idx === idxHueco ? `<span id="hueco-silaba" class="slot-hueco">__</span>` : `<span>${s}</span>`
        ).join(' - ');

        document.getElementById('titulo-silabas').innerHTML = `
            <div style="font-size: 0.95rem; color: var(--text-dim); margin-bottom: 6px;">Ronda ${rondaSilabas}: Completa la palabra</div>
            <div style="font-size: 3.5rem; margin: 5px 0;">${palabraContextoSilaba.icono || '✨'}</div>
            <div style="font-size: 2rem; color: white; margin-top: 5px;">${htmlPalabraIncompleta}</div>
        `;

        const poolDistractores = ["ma", "me", "pa", "pe", "sa", "se", "la", "lo", "ta", "to", "ga", "go", "lu", "na", "be", "so", "pal", "can", "pos", "tre"];
        let ops = [silabaObjetivo];
        while(ops.length < 4) {
            let r = poolDistractores[Math.floor(Math.random() * poolDistractores.length)];
            if(!ops.includes(r)) ops.push(r);
        }
        ops.sort(() => 0.5 - Math.random());

        const cont = document.getElementById('contenedor-opciones-silabas');
        cont.innerHTML = ops.map(s =>
            `<button class="btn-silaba-opcion" data-silaba="${s}">${s}</button>`
        ).join('');

        cont.onclick = (e) => {
            if (bloqueadoSilabas) return;
            const btn = e.target.closest('.btn-silaba-opcion');
            if(!btn) return;

            const elegida = btn.dataset.silaba;
            if(elegida === silabaObjetivo) {
                bloqueadoSilabas = true;
                api.audio.playVictoria();
                btn.style.backgroundColor = 'rgba(0, 230, 118, 0.4)';
                btn.style.borderColor = '#00e676';

                const hueco = document.getElementById('hueco-silaba');
                if (hueco) {
                    hueco.innerText = elegida;
                    hueco.style.color = '#00e676';
                    hueco.style.borderColor = '#00e676';
                }

                window.leerTextoSimple(palabraContextoSilaba.palabra, 0.88);
                api.registrarPalabraDominada(palabraContextoSilaba.palabra);
                rondaSilabas++;
                setTimeout(generarOpcionesSilabas, 1300);
            } else {
                api.audio.playError();
                pronunciarSilaba(elegida);
                btn.classList.add('error-shake');
                btn.style.backgroundColor = 'rgba(255, 23, 68, 0.35)';
                btn.style.borderColor = '#ff1744';
                setTimeout(() => {
                    btn.classList.remove('error-shake');
                    btn.style.backgroundColor = '';
                    btn.style.borderColor = '';
                }, 450);
            }
        };

        const fono = window.convertirSilabaAFonetica(silabaObjetivo);
        window.leerTextoSimple(`Para ${palabraContextoSilaba.palabra}, busca: ${fono}`, 0.86);
    }

    document.getElementById('btn-escuchar-silaba-juego')?.addEventListener('click', () => {
        if (!palabraContextoSilaba) return;
        const fono = window.convertirSilabaAFonetica(silabaObjetivo);
        window.leerTextoSimple(`${palabraContextoSilaba.palabra}. Falta la sílaba: ${fono}`, 0.84);
    });
    document.getElementById('btn-cerrar-silabas')?.addEventListener('click', () => api.toggleModal(api.dom.modales.silabas, false));

    // =========================================================================
    // 4. MEMORAMA: CON AUDIO EN AMBAS CARTAS Y LECTURA SILÁBICA
    // =========================================================================
    let memoVolteadas = [], aciertosMemo = 0, rondaMemorama = 1;
    
    document.getElementById('btn-abrir-memorama')?.addEventListener('click', () => {
        api.toggleModal(api.dom.modales.menuJuegos, false);
        api.toggleModal(api.dom.modales.memorama, true);
        rondaMemorama = 1;
        iniciarMemorama();
    });

    function iniciarMemorama() {
        document.querySelector('#ronda-memorama').innerText = `Ronda ${rondaMemorama} • Une palabra y dibujo`;
        const dic = api.obtenerDiccionario();
        const nivel = api.estado.state.nivelActual;
        
        let validas = dic.filter(p => p.correcta && p.icono && p.nivel <= nivel);
        if(validas.length < 4) validas = dic.filter(p => p.correcta && p.icono);

        let seleccion = [...validas].sort(() => 0.5 - Math.random()).slice(0, 4); 
        let memoCartas = [];
        seleccion.forEach(s => {
            const textoSilabas = s.silabas ? s.silabas.join('-') : s.palabra;
            memoCartas.push({ val: textoSilabas, id: s.palabra, esTexto: true });
            memoCartas.push({ val: s.icono, id: s.palabra, esTexto: false });
        });
        memoCartas.sort(() => 0.5 - Math.random());
        
        aciertosMemo = 0;
        memoVolteadas = [];
        const grid = document.getElementById('grid-memorama');
        grid.innerHTML = memoCartas.map(c => 
            `<div class="carta-memo carta-oculta" data-id="${c.id}" data-texto="${c.esTexto}">${c.val}</div>`
        ).join('');
        
        grid.onclick = (e) => {
            let c = e.target.closest('.carta-memo');
            if(!c || !c.classList.contains('carta-oculta') || memoVolteadas.length >= 2) return;
            
            c.classList.remove('carta-oculta');
            if (c.dataset.texto === 'true') {
                window.leerTextoSimple(c.dataset.id, 0.86);
            }
            memoVolteadas.push(c);
            
            if(memoVolteadas.length === 2) {
                if(memoVolteadas[0].dataset.id === memoVolteadas[1].dataset.id) {
                    api.audio.playVictoria();
                    aciertosMemo++; 
                    // Al hacer match, mostramos la palabra limpia sin guiones
                    memoVolteadas.forEach(card => {
                        card.classList.add('carta-match');
                        if (card.dataset.texto === 'true') card.innerText = card.dataset.id;
                    });
                    api.registrarPalabraDominada(memoVolteadas[0].dataset.id);
                    memoVolteadas = [];
                    
                    if(aciertosMemo === 4) {
                        api.lanzarConfeti();
                        window.mostrarMensaje("¡Tablero completado!", "success");
                        rondaMemorama++;
                        setTimeout(iniciarMemorama, 1300); 
                    }
                } else {
                    api.audio.playError();
                    setTimeout(() => {
                        memoVolteadas[0].classList.add('carta-oculta');
                        memoVolteadas[1].classList.add('carta-oculta');
                        memoVolteadas = [];
                    }, 900);
                }
            }
        };
    }
    document.getElementById('btn-cerrar-memorama')?.addEventListener('click', () => api.toggleModal(api.dom.modales.memorama, false));

    // =========================================================================
    // 5. ORACIONES: FIJA EN VERDE LAS PALABRAS CORRECTAS SI SE EQUIVOCA
    // =========================================================================
    let oracionObjetivo = [];
    let fraseCompletaAudio = "";
    let emojiOracionActual = "💬";
    let rondaOraciones = 1;
    
    document.getElementById('btn-abrir-oraciones')?.addEventListener('click', () => {
        api.toggleModal(api.dom.modales.menuJuegos, false);
        api.toggleModal(api.dom.modales.oraciones, true);
        rondaOraciones = 1;
        iniciarOracion();
    });

    function iniciarOracion() {
        const nivel = api.estado.state.nivelActual;
        let frasesDisponibles = frasesDatos.filter(f => f.nivel <= nivel);
        if(frasesDisponibles.length === 0) frasesDisponibles = frasesDatos;

        let fraseObj = frasesDisponibles[Math.floor(Math.random() * frasesDisponibles.length)];
        fraseCompletaAudio = fraseObj.texto.replace(/-/g, '');
        emojiOracionActual = fraseObj.iconoBoton || "💬";
        oracionObjetivo = fraseCompletaAudio.split(' ');

        document.querySelector('#titulo-oraciones').innerHTML = `Ronda ${rondaOraciones}: Ordena la frase ${emojiOracionActual}`;
        
        // Garantizamos que siempre salga desordenada
        let bloquesAleatorios = [...oracionObjetivo].sort(() => 0.5 - Math.random());
        if (bloquesAleatorios.join(' ') === oracionObjetivo.join(' ') && bloquesAleatorios.length > 1) {
            bloquesAleatorios.reverse();
        }

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
            if(e.target.classList.contains('bloque-palabra') && !e.target.classList.contains('bloque-fijo')) {
                zonaBloques.appendChild(e.target);
            }
        };
        window.leerTextoSimple(fraseCompletaAudio, 0.88);
    }

    document.getElementById('btn-escuchar-oracion')?.addEventListener('click', () => {
        if (fraseCompletaAudio) window.leerTextoSimple(fraseCompletaAudio, 0.85);
    });

    document.getElementById('btn-verificar-oracion')?.addEventListener('click', () => {
        const zonaCons = document.getElementById('zona-construccion');
        const zonaBloq = document.getElementById('zona-bloques');
        const hijos = Array.from(zonaCons.children);
        let construida = hijos.map(c => c.innerText);

        if(construida.join(' ') === oracionObjetivo.join(' ')) {
            hijos.forEach(h => h.classList.add('bloque-fijo'));
            api.audio.playVictoria();
            window.mostrarMensaje("¡Frase perfecta!", "success");
            window.leerTextoSimple(fraseCompletaAudio, 0.92);
            rondaOraciones++;
            setTimeout(iniciarOracion, 1300);
        } else {
            api.audio.playError();
            zonaCons.classList.add('error-shake');
            setTimeout(() => zonaCons.classList.remove('error-shake'), 400);

            // Devolvemos abajo SOLO las palabras que estén en posición incorrecta y fijamos en verde las primeras que estén bien
            let sigueBien = true;
            hijos.forEach((bloque, idx) => {
                if (sigueBien && bloque.innerText === oracionObjetivo[idx]) {
                    bloque.classList.add('bloque-fijo');
                } else {
                    sigueBien = false;
                    bloque.classList.remove('bloque-fijo');
                    zonaBloq.appendChild(bloque);
                }
            });
            window.mostrarMensaje("Te dejé fijas en verde las que iban bien 💡", "info");
        }
    });
    document.getElementById('btn-cerrar-oraciones')?.addEventListener('click', () => api.toggleModal(api.dom.modales.oraciones, false));

    // =========================================================================
    // 6. ARMA Y ESCRIBE + 7. RETO DE NIVEL (CON CASILLAS GUÍA Y PISTA)
    // =========================================================================
    const inputEscritura = document.getElementById('input-escritura');
    const contenedorModoBloques = document.getElementById('escritura-modo-bloques');
    const respBloques = document.getElementById('escritura-respuesta-bloques');
    const opcBloques = document.getElementById('escritura-opciones-bloques');
    const btnMic = document.getElementById('btn-dictar-voz');

    let itemObjetivoEscritura = null;
    let rondaEscritura = 1;

    function armarUIporSilabas(itemPalabra, contenedorRespuesta, contenedorOpciones) {
        const silabasReales = itemPalabra.silabas || [itemPalabra.palabra.toLowerCase()];
        // Creamos casillas vacías visibles para que sepa cuántas sílabas lleva la palabra
        contenedorRespuesta.innerHTML = silabasReales.map((_, i) => 
            `<div class="casilla-silaba" data-slot="${i}">__</div>`
        ).join('');

        const distractoresPool = ["ma", "pa", "sa", "la", "to", "lu", "pe", "ro", "ta", "mi", "no", "so"];
        let distractores = distractoresPool
            .filter(d => !silabasReales.map(s => normalizarTexto(s)).includes(normalizarTexto(d)))
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);

        let todasOpciones = [...silabasReales, ...distractores].sort(() => 0.5 - Math.random());
        contenedorOpciones.innerHTML = todasOpciones.map(s => `<div class="bloque-palabra">${s}</div>`).join('');

        contenedorOpciones.onclick = (e) => {
            const btn = e.target.closest('.bloque-palabra');
            if (!btn) return;
            const slotLibre = contenedorRespuesta.querySelector('.casilla-silaba:not(.ocupada)');
            if (!slotLibre) return;

            pronunciarSilaba(btn.innerText);
            slotLibre.innerText = btn.innerText;
            slotLibre.classList.add('ocupada');
            slotLibre.dataset.valor = btn.innerText;
            btn.classList.add('hidden');
            slotLibre._botonOrigen = btn;
        };

        contenedorRespuesta.onclick = (e) => {
            const slot = e.target.closest('.casilla-silaba.ocupada');
            if (!slot || slot.classList.contains('bloque-fijo')) return;
            if (slot._botonOrigen) slot._botonOrigen.classList.remove('hidden');
            slot.innerText = '__';
            slot.classList.remove('ocupada');
            delete slot.dataset.valor;
        };
    }

    function validarSlotsSilabas(itemPalabra, contenedorRespuesta) {
        const silabasReales = itemPalabra.silabas || [itemPalabra.palabra.toLowerCase()];
        const slots = Array.from(contenedorRespuesta.querySelectorAll('.casilla-silaba'));
        let todoCorrecto = true;

        slots.forEach((slot, idx) => {
            const valorPuesto = slot.dataset.valor || '';
            if (normalizarTexto(valorPuesto) === normalizarTexto(silabasReales[idx])) {
                slot.classList.add('bloque-fijo');
            } else {
                todoCorrecto = false;
                if (slot.classList.contains('ocupada')) {
                    if (slot._botonOrigen) slot._botonOrigen.classList.remove('hidden');
                    slot.innerText = '__';
                    slot.classList.remove('ocupada');
                    delete slot.dataset.valor;
                }
            }
        });
        return todoCorrecto;
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
            ? `Ronda ${rondaEscritura}: Arma la palabra`
            : `Ronda ${rondaEscritura}: Escribe la palabra`;

        const dic = api.obtenerDiccionario();
        let disp = dic.filter(p => p.correcta && p.nivel <= nivel && p.icono);
        if(disp.length === 0) disp = dic.filter(p => p.correcta && p.icono);

        itemObjetivoEscritura = disp[Math.floor(Math.random() * disp.length)];
        document.getElementById('imagen-leer').innerText = itemObjetivoEscritura.icono || '❓';
        inputEscritura.value = "";

        if (btnMic) btnMic.style.display = navigator.onLine ? 'inline-flex' : 'none';

        if (nivel <= 2) {
            contenedorModoBloques.classList.remove('hidden');
            inputEscritura.classList.add('hidden');
            armarUIporSilabas(itemObjetivoEscritura, respBloques, opcBloques);
        } else {
            contenedorModoBloques.classList.add('hidden');
            inputEscritura.classList.remove('hidden');
            inputEscritura.placeholder = `Pista: empieza con "${itemObjetivoEscritura.silabas ? itemObjetivoEscritura.silabas[0] : itemObjetivoEscritura.palabra[0]}..."`;
        }
        window.leerTextoSimple(itemObjetivoEscritura.palabra, 0.86);
    }

    document.getElementById('btn-escuchar-palabra')?.addEventListener('click', () => {
        if (itemObjetivoEscritura) window.leerTextoSimple(itemObjetivoEscritura.palabra, 0.84);
    });
    
    btnMic?.addEventListener('click', (e) => {
        if (!navigator.onLine) {
            return window.mostrarMensaje("Sin internet usa las sílabas en pantalla", "info");
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return window.mostrarMensaje("Micrófono no soportado.", "error");
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
        let acierto = false;

        if (forzarTexto !== null) {
            acierto = (normalizarTexto(forzarTexto) === normalizarTexto(itemObjetivoEscritura.palabra));
        } else if (nivel <= 2) {
            acierto = validarSlotsSilabas(itemObjetivoEscritura, respBloques);
        } else {
            acierto = (normalizarTexto(inputEscritura.value) === normalizarTexto(itemObjetivoEscritura.palabra));
        }

        if (acierto) {
            api.audio.playVictoria();
            window.mostrarMensaje(`¡Excelente! "${itemObjetivoEscritura.palabra}"`, "success");
            window.leerTextoSimple(itemObjetivoEscritura.palabra, 0.9);
            api.registrarPalabraDominada(itemObjetivoEscritura.palabra);
            rondaEscritura++;
            setTimeout(iniciarEscritura, 1100);
        } else {
            api.audio.playError();
            const targetShake = nivel <= 2 ? respBloques : inputEscritura;
            targetShake.classList.add('error-shake');
            setTimeout(() => targetShake.classList.remove('error-shake'), 400);
            window.mostrarMensaje("Casi, intenta con otra sílaba 💡", "info");
        }
    }

    document.getElementById('btn-verificar-escritura')?.addEventListener('click', () => verificarRespuestaEscritura());
    document.getElementById('btn-cerrar-escritura')?.addEventListener('click', () => api.toggleModal(api.dom.modales.escritura, false));

    // =========================================================================
    // 7. RETO DE NIVEL (3 CORAZONES ❤️❤️❤️)
    // =========================================================================
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
            inputExamen.placeholder = `Empieza con "${itemActualJefe.silabas ? itemActualJefe.silabas[0] : itemActualJefe.palabra[0]}..."`;
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
        const esCorrecto = nivel <= 2
            ? validarSlotsSilabas(itemActualJefe, examenRespBloques)
            : (normalizarTexto(inputExamen.value) === normalizarTexto(itemActualJefe.palabra));

        if (esCorrecto) {
            api.audio.playVictoria();
            api.registrarPalabraDominada(itemActualJefe.palabra);
            aciertosJefe++;

            if (aciertosJefe >= 3) {
                const nuevoNivel = Math.min(4, api.estado.state.nivelActual + 1);
                api.estado.update('nivelActual', nuevoNivel);
                api.lanzarConfeti();
                window.mostrarMensaje(`¡Reto superado! Nivel ${nuevoNivel} desbloqueado 🏆`, "success");
                api.toggleModal(api.dom.modales.examen, false);
                setTimeout(() => api.inicializarTarjetas(), 600);
            } else {
                window.mostrarMensaje("¡Muy bien! Siguiente palabra", "success");
                setTimeout(cargarPalabraJefe, 850);
            }
        } else {
            vidasJefe--;
            api.audio.playError();
            actualizarHUDJefe();
            const tarjeta = document.getElementById('tarjeta-examen');
            tarjeta.classList.add('error-shake');
            setTimeout(() => tarjeta.classList.remove('error-shake'), 400);

            if (vidasJefe <= 0) {
                window.mostrarMensaje("Se acabaron los corazones. ¡Puedes intentarlo de nuevo cuando quieras!", "info");
                api.toggleModal(api.dom.modales.examen, false);
            } else {
                window.leerTextoSimple(`Escucha: ${itemActualJefe.palabra}`, 0.82);
            }
        }
    });

    document.getElementById('btn-salir-examen')?.addEventListener('click', () => {
        api.toggleModal(api.dom.modales.examen, false);
    });
});
