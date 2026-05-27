const frasesDatos = [
    // --- NIVEL 1: Sílabas simples (12 frases) ---
    { "id": 1, "texto": "pa-sa la ta-za", "tipo": "reto", "iconoBoton": "☕", "nivel": 1 },
    { "id": 2, "texto": "mi ro-pa nue-va", "tipo": "moda", "iconoBoton": "👗", "nivel": 1 },
    { "id": 3, "texto": "te de-jo la lla-ve", "tipo": "reto", "iconoBoton": "🔑", "nivel": 1 },
    { "id": 4, "texto": "su-be a tu ca-ma", "tipo": "reto", "iconoBoton": "🛏️", "nivel": 1 },
    { "id": 5, "texto": "bo-ta la ba-su-ra", "tipo": "reto", "iconoBoton": "🗑️", "nivel": 1 },
    { "id": 6, "texto": "la so-pa es-tá ri-ca", "tipo": "comida", "iconoBoton": "🥣", "nivel": 1 },
    { "id": 7, "texto": "to-ma tu ju-go", "tipo": "comida", "iconoBoton": "🧃", "nivel": 1 },
    { "id": 8, "texto": "me du-e-le el de-do", "tipo": "reto", "iconoBoton": "🤕", "nivel": 1 },
    { "id": 9, "texto": "da-me la ma-no", "tipo": "amor", "iconoBoton": "🤝", "nivel": 1 },
    { "id": 10, "texto": "la ca-sa es tu-ya", "tipo": "reto", "iconoBoton": "🏠", "nivel": 1 },
    { "id": 11, "texto": "e-sa es mi me-sa", "tipo": "reto", "iconoBoton": "🪑", "nivel": 1 },
    { "id": 12, "texto": "di-me to-do", "tipo": "chisme", "iconoBoton": "🗣️", "nivel": 1 },

    // --- NIVEL 2: Frenos y Jerga (10 frases) ---
    { "id": 13, "texto": "qué pal-ta con él", "tipo": "broma", "iconoBoton": "🥑", "nivel": 2 },
    { "id": 14, "texto": "pon el cel a-quí", "tipo": "reto", "iconoBoton": "📱", "nivel": 2 },
    { "id": 15, "texto": "sal de a-hí", "tipo": "reto", "iconoBoton": "🏃‍♀️", "nivel": 2 },
    { "id": 16, "texto": "haz-me un fa-vor", "tipo": "reto", "iconoBoton": "🙏", "nivel": 2 },
    { "id": 17, "texto": "pon la can-ción", "tipo": "cancion", "iconoBoton": "🎧", "nivel": 2 },
    { "id": 18, "texto": "es-tás muy top", "tipo": "moda", "iconoBoton": "✨", "nivel": 2 },
    { "id": 19, "texto": "fies-ta en la ca-sa", "tipo": "reto", "iconoBoton": "🎉", "nivel": 2 },
    { "id": 20, "texto": "mi-ra a e-se man", "tipo": "chisme", "iconoBoton": "👀", "nivel": 2 },
    { "id": 21, "texto": "no quie-ro ir", "tipo": "reto", "iconoBoton": "🙅‍♀️", "nivel": 2 },
    { "id": 22, "texto": "un pan con que-so", "tipo": "comida", "iconoBoton": "🥪", "nivel": 2 },

    // --- TARJETAS TRAMPA (Mezcladas en niveles altos) ---
    { "id": 23, "texto": "No le-as es-to to-ca la ca-sa", "tipo": "trampa", "iconoBoton": "🚨", "nivel": 2 },
    { "id": 24, "texto": "To-ca el re-ga-lo no le-as", "tipo": "trampa", "iconoBoton": "🚨", "nivel": 3 },

    // --- NIVEL 3: Sílabas Trabadas (10 frases) ---
    { "id": 25, "texto": "gran pro-ble-ma", "tipo": "chisme", "iconoBoton": "😱", "nivel": 3 },
    { "id": 26, "texto": "fra-se de a-mor", "tipo": "amor", "iconoBoton": "💌", "nivel": 3 },
    { "id": 27, "texto": "bro-ma pe-sa-da", "tipo": "broma", "iconoBoton": "😂", "nivel": 3 },
    { "id": 28, "texto": "com-pra za-pa-ti-llas", "tipo": "moda", "iconoBoton": "👟", "nivel": 3 },
    { "id": 29, "texto": "a-bre la puer-ta", "tipo": "reto", "iconoBoton": "🚪", "nivel": 3 },
    { "id": 30, "texto": "el dra-gón ti-ra fue-go", "tipo": "reto", "iconoBoton": "🐉", "nivel": 3 },
    { "id": 31, "texto": "tre-men-do chi-sme", "tipo": "chisme", "iconoBoton": "🤫", "nivel": 3 },
    { "id": 32, "texto": "me com-pré un pos-tre", "tipo": "comida", "iconoBoton": "🍰", "nivel": 3 },
    { "id": 33, "texto": "blo-que-a a e-se chi-co", "tipo": "reto", "iconoBoton": "🚫", "nivel": 3 },
    { "id": 34, "texto": "no te a-tra-ses", "tipo": "reto", "iconoBoton": "⏰", "nivel": 3 },

    // --- NIVEL 4: TikTok sin guiones (8 frases) ---
    { "id": 35, "texto": "Contexto por favor", "tipo": "tiktok", "iconoBoton": "🤔", "nivel": 4 },
    { "id": 36, "texto": "Pov eres la mayor", "tipo": "tiktok", "iconoBoton": "👑", "nivel": 4 },
    { "id": 37, "texto": "Storytime de cómo", "tipo": "tiktok", "iconoBoton": "📖", "nivel": 4 },
    { "id": 38, "texto": "Etiqueta a tu mejor amiga", "tipo": "tiktok", "iconoBoton": "👯‍♀️", "nivel": 4 },
    { "id": 39, "texto": "Yo cuando veo a mi crush", "tipo": "tiktok", "iconoBoton": "😍", "nivel": 4 },
    { "id": 40, "texto": "Cosas que pasan en el barrio", "tipo": "tiktok", "iconoBoton": "🏘️", "nivel": 4 },
    { "id": 41, "texto": "Mi primera chamba", "tipo": "tiktok", "iconoBoton": "👷‍♀️", "nivel": 4 },
    { "id": 42, "texto": "Hoy se sale con las de siempre", "tipo": "tiktok", "iconoBoton": "💅", "nivel": 4 }
];
