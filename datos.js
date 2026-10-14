// --- BANCO DE FRASES PARA EL FEED PRINCIPAL (LECTURA ESTILO TIKTOK) ---
const frasesDatos = [
    // NIVEL 1: Sílabas directas (M, P, S, L, T, D, N, C, B, V, G, J, R)
    { "id": 1, "texto": "pa-sa la ta-za", "tipo": "reto", "iconoBoton": "☕", "nivel": 1 },
    { "id": 2, "texto": "la so-pa es-tá ri-ca", "tipo": "comida", "iconoBoton": "🥣", "nivel": 1 },
    { "id": 3, "texto": "su-be a tu ca-ma", "tipo": "reto", "iconoBoton": "🛏️", "nivel": 1 },
    { "id": 4, "texto": "da-me la ma-no", "tipo": "amor", "iconoBoton": "🤝", "nivel": 1 },
    { "id": 5, "texto": "to-ma tu ju-go", "tipo": "comida", "iconoBoton": "🧃", "nivel": 1 },
    { "id": 101, "texto": "pa-pá me mi-ra", "tipo": "familia", "iconoBoton": "👀", "nivel": 1 },
    { "id": 102, "texto": "yo ve-o un ga-to", "tipo": "animales", "iconoBoton": "🐈", "nivel": 1 },
    { "id": 103, "texto": "la mo-to su-be", "tipo": "vehiculo", "iconoBoton": "🏍️", "nivel": 1 },
    { "id": 104, "texto": "da-me un be-so", "tipo": "amor", "iconoBoton": "😘", "nivel": 1 },
    { "id": 105, "texto": "e-sa es mi me-sa", "tipo": "reto", "iconoBoton": "🪑", "nivel": 1 },
    { "id": 106, "texto": "la lu-na ba-ja", "tipo": "reto", "iconoBoton": "🌙", "nivel": 1 },
    { "id": 107, "texto": "pe-lo ro-jo", "tipo": "moda", "iconoBoton": "👩‍🦰", "nivel": 1 },
    { "id": 108, "texto": "mi po-lo nue-vo", "tipo": "moda", "iconoBoton": "👕", "nivel": 1 },

    // NIVEL 2: Sílabas inversas, mixtas y MODO HISTORIA
    { "id": 201, "historia": 1, "orden": 1, "texto": "ha-bí-a un pe-rro", "tipo": "cuento", "iconoBoton": "🐕", "nivel": 2 },
    { "id": 202, "historia": 1, "orden": 2, "texto": "se co-mió mi pan", "tipo": "cuento", "iconoBoton": "🥖", "nivel": 2 },
    { "id": 203, "historia": 1, "orden": 3, "texto": "y se fue co-rrien-do", "tipo": "cuento", "iconoBoton": "💨", "nivel": 2 },
    { "id": 13, "texto": "qué pal-ta con él", "tipo": "broma", "iconoBoton": "🥑", "nivel": 2 },
    { "id": 14, "texto": "pon el cel a-quí", "tipo": "reto", "iconoBoton": "📱", "nivel": 2 },
    { "id": 15, "texto": "sal de a-hí", "tipo": "reto", "iconoBoton": "🏃‍♀️", "nivel": 2 },
    { "id": 17, "texto": "pon la can-ción", "tipo": "cancion", "iconoBoton": "🎧", "nivel": 2 },
    { "id": 18, "texto": "es-tás muy top", "tipo": "moda", "iconoBoton": "✨", "nivel": 2 },
    { "id": 19, "texto": "fies-ta en la ca-sa", "tipo": "reto", "iconoBoton": "🎉", "nivel": 2 },
    { "id": 20, "texto": "va-mos al ci-ne", "tipo": "salida", "iconoBoton": "🍿", "nivel": 2 },

    // NIVEL 3: Sílabas Trabadas (Br, Cr, Gr, Tr, Pl, Bl, Fr, Dr)
    { "id": 25, "texto": "gran pro-ble-ma", "tipo": "chisme", "iconoBoton": "😱", "nivel": 3 },
    { "id": 26, "texto": "fra-se de a-mor", "tipo": "amor", "iconoBoton": "💌", "nivel": 3 },
    { "id": 27, "texto": "bro-ma pe-sa-da", "tipo": "broma", "iconoBoton": "😂", "nivel": 3 },
    { "id": 28, "texto": "com-pra za-pa-ti-llas", "tipo": "moda", "iconoBoton": "👟", "nivel": 3 },
    { "id": 30, "texto": "el dra-gón ti-ra fue-go", "tipo": "reto", "iconoBoton": "🐉", "nivel": 3 },
    { "id": 32, "texto": "me com-pré un pos-tre", "tipo": "comida", "iconoBoton": "🍰", "nivel": 3 },
    { "id": 33, "texto": "blo-que-a a e-se chi-co", "tipo": "reto", "iconoBoton": "🚫", "nivel": 3 },
    { "id": 34, "texto": "chi-ca con es-ti-lo", "tipo": "moda", "iconoBoton": "💅", "nivel": 3 },

    // NIVEL 4: Fluidez (Textos sin guiones estilo TikTok)
    { "id": 35, "texto": "Contexto por favor", "tipo": "tiktok", "iconoBoton": "🤔", "nivel": 4 },
    { "id": 36, "texto": "Pov eres la mayor", "tipo": "tiktok", "iconoBoton": "👑", "nivel": 4 },
    { "id": 37, "texto": "Storytime de cómo pasó", "tipo": "tiktok", "iconoBoton": "📖", "nivel": 4 },
    { "id": 38, "texto": "Etiqueta a tu mejor amiga", "tipo": "tiktok", "iconoBoton": "👯‍♀️", "nivel": 4 },
    { "id": 39, "texto": "Yo cuando veo a mi crush", "tipo": "tiktok", "iconoBoton": "😍", "nivel": 4 },
    { "id": 41, "texto": "Mi primera chamba", "tipo": "tiktok", "iconoBoton": "👷‍♀️", "nivel": 4 },
    { "id": 42, "texto": "Arréglate conmigo para salir", "tipo": "tiktok", "iconoBoton": "💄", "nivel": 4 }
];

// --- BANCO DE PALABRAS PARA MINIJUEGOS (SWIPE, MEMORAMA, ESCRITURA, JEFE) ---
const palabrasDatos = [
    // NIVEL 1: Palabras reales
    { palabra: "Mamá", silabas: ["ma", "má"], correcta: true, nivel: 1, icono: "👩‍👧" },
    { palabra: "Papá", silabas: ["pa", "pá"], correcta: true, nivel: 1, icono: "👨" },
    { palabra: "Mesa", silabas: ["me", "sa"], correcta: true, nivel: 1, icono: "🪑" },
    { palabra: "Mano", silabas: ["ma", "no"], correcta: true, nivel: 1, icono: "✋" },
    { palabra: "Gato", silabas: ["ga", "to"], correcta: true, nivel: 1, icono: "🐈" },
    { palabra: "Sopa", silabas: ["so", "pa"], correcta: true, nivel: 1, icono: "🥣" },
    { palabra: "Luna", silabas: ["lu", "na"], correcta: true, nivel: 1, icono: "🌙" },
    { palabra: "Taza", silabas: ["ta", "za"], correcta: true, nivel: 1, icono: "☕" },
    { palabra: "Moto", silabas: ["mo", "to"], correcta: true, nivel: 1, icono: "🏍️" },
    { palabra: "Jugo", silabas: ["ju", "go"], correcta: true, nivel: 1, icono: "🧃" },
    { palabra: "Polo", silabas: ["po", "lo"], correcta: true, nivel: 1, icono: "👕" },
    { palabra: "Beso", silabas: ["be", "so"], correcta: true, nivel: 1, icono: "😘" },
    // NIVEL 1: Palabras falsas (para entrenar discriminación visual en Swipe)
    { palabra: "Mepa", silabas: ["me", "pa"], correcta: false, nivel: 1 },
    { palabra: "Sato", silabas: ["sa", "to"], correcta: false, nivel: 1 },
    { palabra: "Luma", silabas: ["lu", "ma"], correcta: false, nivel: 1 },
    { palabra: "Topa", silabas: ["to", "pa"], correcta: false, nivel: 1 },
    { palabra: "Pesa", silabas: ["pe", "sa"], correcta: true, nivel: 1, icono: "🏋️‍♀️" },
    { palabra: "Namo", silabas: ["na", "mo"], correcta: false, nivel: 1 },

    // NIVEL 2: Palabras reales
    { palabra: "Perro", silabas: ["pe", "rro"], correcta: true, nivel: 2, icono: "🐕" },
    { palabra: "Palta", silabas: ["pal", "ta"], correcta: true, nivel: 2, icono: "🥑" },
    { palabra: "Fiesta", silabas: ["fies", "ta"], correcta: true, nivel: 2, icono: "🎉" },
    { palabra: "Lentes", silabas: ["len", "tes"], correcta: true, nivel: 2, icono: "🕶️" },
    { palabra: "Celular", silabas: ["ce", "lu", "lar"], correcta: true, nivel: 2, icono: "📱" },
    { palabra: "Canción", silabas: ["can", "ción"], correcta: true, nivel: 2, icono: "🎧" },
    { palabra: "Pastel", silabas: ["pas", "tel"], correcta: true, nivel: 2, icono: "🎂" },
    { palabra: "Árbol", silabas: ["ár", "bol"], correcta: true, nivel: 2, icono: "🌳" },
    // NIVEL 2: Palabras falsas
    { palabra: "Pelta", silabas: ["pel", "ta"], correcta: false, nivel: 2 },
    { palabra: "Fosta", silabas: ["fos", "ta"], correcta: false, nivel: 2 },
    { palabra: "Cantarón", silabas: ["can", "ta", "rón"], correcta: false, nivel: 2 },
    { palabra: "Lantes", silabas: ["lan", "tes"], correcta: false, nivel: 2 },

    // NIVEL 3: Palabras reales (trabadas)
    { palabra: "Postre", silabas: ["pos", "tre"], correcta: true, nivel: 3, icono: "🍰" },
    { palabra: "Dragón", silabas: ["dra", "gón"], correcta: true, nivel: 3, icono: "🐉" },
    { palabra: "Broma", silabas: ["bro", "ma"], correcta: true, nivel: 3, icono: "😂" },
    { palabra: "Premio", silabas: ["pre", "mio"], correcta: true, nivel: 3, icono: "🏆" },
    { palabra: "Estrella", silabas: ["es", "tre", "lla"], correcta: true, nivel: 3, icono: "⭐" },
    { palabra: "Fresa", silabas: ["fre", "sa"], correcta: true, nivel: 3, icono: "🍓" },
    { palabra: "Plátano", silabas: ["plá", "ta", "no"], correcta: true, nivel: 3, icono: "🍌" },
    // NIVEL 3: Palabras falsas
    { palabra: "Prosta", silabas: ["pros", "ta"], correcta: false, nivel: 3 },
    { palabra: "Brumaña", silabas: ["bru", "ma", "ña"], correcta: false, nivel: 3 },
    { palabra: "Drogán", silabas: ["dro", "gán"], correcta: false, nivel: 3 },

    // NIVEL 4: Palabras reales (fluidez y cultura juvenil)
    { palabra: "Amiga", silabas: ["a", "mi", "ga"], correcta: true, nivel: 4, icono: "👯‍♀️" },
    { palabra: "Chamba", silabas: ["cham", "ba"], correcta: true, nivel: 4, icono: "👷‍♀️" },
    { palabra: "Corona", silabas: ["co", "ro", "na"], correcta: true, nivel: 4, icono: "👑" },
    { palabra: "Maquillaje", silabas: ["ma", "qui", "lla", "je"], correcta: true, nivel: 4, icono: "💄" },
    { palabra: "Zapatillas", silabas: ["za", "pa", "ti", "llas"], correcta: true, nivel: 4, icono: "👟" },
    { palabra: "Perfume", silabas: ["per", "fu", "me"], correcta: true, nivel: 4, icono: "✨" },
    // NIVEL 4: Palabras falsas
    { palabra: "Chimbaña", silabas: ["chim", "ba", "ña"], correcta: false, nivel: 4 },
    { palabra: "Zapatoca", silabas: ["za", "pa", "to", "ca"], correcta: false, nivel: 4 }
];

// --- FONEMAS CLAROS PARA EL JUEGO DEL ABECEDARIO ---
const fonemasLetras = [
    { letra: "A", audio: "Letra a, como en árbol", pista: "🌳 Empieza como: Árbol, Amiga" },
    { letra: "E", audio: "Letra e, como en estrella", pista: "⭐ Empieza como: Estrella, Espejo" },
    { letra: "I", audio: "Letra i, como en isla", pista: "🏝️ Empieza como: Isla, Imán" },
    { letra: "O", audio: "Letra o, como en oso", pista: "🐻 Empieza como: Oso, Ojo" },
    { letra: "U", audio: "Letra u, como en uva", pista: "🍇 Empieza como: Uva, Uña" },
    { letra: "M", audio: "Sonido mmm, como en mamá y mano", pista: "✋ Suena al inicio de: Mamá, Mano, Mesa" },
    { letra: "P", audio: "Sonido p, como en papá y polo", pista: "👕 Suena al inicio de: Papá, Polo, Palta" },
    { letra: "S", audio: "Sonido sss, como en sopa y sol", pista: "🥣 Suena al inicio de: Sopa, Sol, Silla" },
    { letra: "L", audio: "Sonido lll, como en luna y lentes", pista: "🌙 Suena al inicio de: Luna, Lentes, Limón" },
    { letra: "T", audio: "Sonido t, como en taza y tela", pista: "☕ Suena al inicio de: Taza, Tomate, Tío" },
    { letra: "D", audio: "Sonido d, como en dado y dedo", pista: "🎲 Suena al inicio de: Dado, Dedo, Día" },
    { letra: "N", audio: "Sonido nnn, como en nube y noche", pista: "☁️ Suena al inicio de: Nube, Noche, Nada" },
    { letra: "C", audio: "Sonido k, como en casa y cama", pista: "🛏️ Suena al inicio de: Casa, Cama, Copa" },
    { letra: "B", audio: "Sonido b, como en beso y baile", pista: "😘 Suena al inicio de: Beso, Baile, Bonito" },
    { letra: "G", audio: "Sonido g, como en gato y gota", pista: "🐈 Suena al inicio de: Gato, Gota, Gol" },
    { letra: "J", audio: "Sonido jjj, como en jugo y joya", pista: "🧃 Suena al inicio de: Jugo, Joya, Jueves" },
    { letra: "R", audio: "Sonido rrr, como en risa y rojo", pista: "🌹 Suena al inicio de: Risa, Rojo, Rosa" },
    { letra: "F", audio: "Sonido fff, como en fiesta y foto", pista: "🎉 Suena al inicio de: Fiesta, Foto, Fresa" }
];
