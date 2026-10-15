// --- DICCIONARIO FONÉTICO ANTIDELETREO ---
const FonoSilabas = {
    "a": "á.", "e": "é.", "i": "í.", "o": "ó.", "u": "ú.",
    "ma": "má.", "me": "mé.", "mi": "mí.", "mo": "mó.", "mu": "mú.",
    "pa": "pá.", "pe": "pé.", "pi": "pí.", "po": "pó.", "pu": "pú.",
    "sa": "sá.", "se": "sé.", "si": "sí.", "so": "só.", "su": "sú.",
    "la": "lá.", "le": "lé.", "li": "lí.", "lo": "ló.", "lu": "lú.",
    "ta": "tá.", "te": "té.", "ti": "tí.", "to": "tó.", "tu": "tú.",
    "da": "dá.", "de": "dé.", "di": "dí.", "do": "dó.", "du": "dú.",
    "na": "ná.", "ne": "né.", "ni": "ní.", "no": "nó.", "nu": "nú.",
    "ca": "ká.", "co": "kó.", "cu": "kú.", "que": "ké.", "qui": "kí.",
    "ba": "bá.", "be": "bé.", "bi": "bí.", "bo": "bó.", "bu": "bú.",
    "va": "bá.", "ve": "bé.", "vi": "bí.", "vo": "bó.", "vu": "bú.",
    "ga": "gá.", "go": "gó.", "gu": "gú.", "gue": "gué.", "gui": "guí.",
    "ja": "já.", "je": "jé.", "ji": "jí.", "jo": "jó.", "ju": "jú.",
    "ra": "rrá.", "re": "rré.", "ri": "rrí.", "ro": "rró.", "ru": "rrú.",
    "rra": "rrá.", "rre": "rré.", "rri": "rrí.", "rro": "rró.", "rru": "rrú.",
    "fa": "fá.", "fe": "fé.", "fi": "fí.", "fo": "fó.", "fu": "fú.",
    "za": "sá.", "zo": "só.", "zu": "sú.", "ce": "sé.", "ci": "sí.",
    "cha": "chá.", "che": "ché.", "chi": "chí.", "cho": "chó.", "chu": "chú.",
    "lla": "yá.", "lle": "yé.", "lli": "yí.", "llo": "yó.", "llu": "yú.",
    "ña": "ñá.", "ñe": "ñé.", "ñi": "ñí.", "ño": "ñó.", "ñu": "ñú.",
    "ya": "yá.", "ye": "yé.", "yi": "yí.", "yo": "yó.", "yu": "yú.",
    "bra": "brá.", "bre": "bré.", "bri": "brí.", "bro": "bró.", "bru": "brú.",
    "cra": "krá.", "cre": "kré.", "cri": "krí.", "cro": "kró.", "cru": "krú.",
    "dra": "drá.", "dre": "dré.", "dri": "drí.", "dro": "dró.", "dru": "drú.",
    "fra": "frá.", "fre": "fré.", "fri": "frí.", "fro": "fró.", "fru": "frú.",
    "gra": "grá.", "gre": "gré.", "gri": "grí.", "gro": "gró.", "gru": "grú.",
    "pla": "plá.", "ple": "plé.", "pli": "plí.", "plo": "pló.", "plu": "plú.",
    "pra": "prá.", "pre": "pré.", "pri": "prí.", "pro": "pró.", "pru": "prú.",
    "tra": "trá.", "tre": "tré.", "tri": "trí.", "tro": "tró.", "tru": "trú.",
    "blo": "bló.", "bla": "blá.", "ble": "blé.",
    "pal": "pál.", "pan": "pán.", "cel": "sél.", "sol": "sól.", "mar": "már.",
    "len": "lén.", "tes": "tés.", "can": "kán.", "cion": "sión.", "ción": "sión.",
    "pas": "pás.", "tel": "tél.", "pos": "pós.", "fies": "fiés.", "cham": "chám."
};

// --- FRASES PARA EL FEED (CADA ÍCONO REPRESENTA EXACTAMENTE LA FRASE) ---
const frasesDatos = [
    // NIVEL 1
    { "id": 1, "texto": "pa-sa la ta-za", "tipo": "casa", "iconoBoton": "☕", "nivel": 1 },
    { "id": 2, "texto": "la so-pa es-tá ri-ca", "tipo": "comida", "iconoBoton": "🥣", "nivel": 1 },
    { "id": 3, "texto": "su-be a tu ca-ma", "tipo": "descanso", "iconoBoton": "🛏️", "nivel": 1 },
    { "id": 4, "texto": "da-me la ma-no", "tipo": "amistad", "iconoBoton": "✋", "nivel": 1 },
    { "id": 5, "texto": "to-ma tu ju-go", "tipo": "bebida", "iconoBoton": "🧃", "nivel": 1 },
    { "id": 101, "texto": "mi ga-to bo-ni-to", "tipo": "mascotas", "iconoBoton": "🐈", "nivel": 1 },
    { "id": 102, "texto": "la mo-to rá-pi-da", "tipo": "vehiculo", "iconoBoton": "🏍️", "nivel": 1 },
    { "id": 103, "texto": "da-me un be-so", "tipo": "cariño", "iconoBoton": "😘", "nivel": 1 },
    { "id": 104, "texto": "sién-ta-te en la si-lla", "tipo": "casa", "iconoBoton": "🪑", "nivel": 1 },
    { "id": 105, "texto": "la lu-na bri-lla", "tipo": "noche", "iconoBoton": "🌙", "nivel": 1 },
    { "id": 106, "texto": "mi po-lo nue-vo", "tipo": "ropa", "iconoBoton": "👕", "nivel": 1 },

    // NIVEL 2
    { "id": 201, "historia": 1, "orden": 1, "texto": "ha-bí-a un pe-rro", "tipo": "cuento", "iconoBoton": "🐕", "nivel": 2 },
    { "id": 202, "historia": 1, "orden": 2, "texto": "se co-mió mi pan", "tipo": "cuento", "iconoBoton": "🥖", "nivel": 2 },
    { "id": 203, "historia": 1, "orden": 3, "texto": "y se fue co-rrien-do", "tipo": "cuento", "iconoBoton": "💨", "nivel": 2 },
    { "id": 13, "texto": "pan con pal-ta", "tipo": "comida", "iconoBoton": "🥑", "nivel": 2 },
    { "id": 14, "texto": "mi-ra tu ce-lu-lar", "tipo": "redes", "iconoBoton": "📱", "nivel": 2 },
    { "id": 17, "texto": "es-cu-cha la can-ción", "tipo": "música", "iconoBoton": "🎧", "nivel": 2 },
    { "id": 19, "texto": "fies-ta en la ca-sa", "tipo": "evento", "iconoBoton": "🎉", "nivel": 2 },
    { "id": 20, "texto": "va-mos al ci-ne", "tipo": "salida", "iconoBoton": "🍿", "nivel": 2 },

    // NIVEL 3
    { "id": 25, "texto": "un gran pre-mio", "tipo": "logro", "iconoBoton": "🏆", "nivel": 3 },
    { "id": 26, "texto": "car-ta de a-mor", "tipo": "amor", "iconoBoton": "💌", "nivel": 3 },
    { "id": 27, "texto": "u-na bro-ma di-ver-ti-da", "tipo": "humor", "iconoBoton": "😂", "nivel": 3 },
    { "id": 28, "texto": "za-pa-ti-llas nue-vas", "tipo": "moda", "iconoBoton": "👟", "nivel": 3 },
    { "id": 30, "texto": "el dra-gón ti-ra fue-go", "tipo": "fantasía", "iconoBoton": "🐉", "nivel": 3 },
    { "id": 32, "texto": "me com-pré un pos-tre", "tipo": "dulce", "iconoBoton": "🍰", "nivel": 3 },

    // NIVEL 4
    { "id": 35, "texto": "Contexto por favor", "tipo": "tiktok", "iconoBoton": "🤔", "nivel": 4 },
    { "id": 36, "texto": "Tienes la corona hoy", "tipo": "tiktok", "iconoBoton": "👑", "nivel": 4 },
    { "id": 37, "texto": "Historia de cómo pasó", "tipo": "tiktok", "iconoBoton": "📖", "nivel": 4 },
    { "id": 38, "texto": "Saludo a mi mejor amiga", "tipo": "tiktok", "iconoBoton": "👯‍♀️", "nivel": 4 },
    { "id": 41, "texto": "Mi primera chamba", "tipo": "tiktok", "iconoBoton": "👷‍♀️", "nivel": 4 },
    { "id": 42, "texto": "Arréglate conmigo hoy", "tipo": "tiktok", "iconoBoton": "💄", "nivel": 4 }
];

// --- BANCO DE PALABRAS CON ÍCONOS 100% EXACTOS E INEQUÍVOCOS ---
const palabrasDatos = [
    // NIVEL 1: Reales (Ícono = Objeto exacto)
    { palabra: "Silla", silabas: ["si", "lla"], correcta: true, nivel: 1, icono: "🪑" },
    { palabra: "Cama", silabas: ["ca", "ma"], correcta: true, nivel: 1, icono: "🛏️" },
    { palabra: "Mano", silabas: ["ma", "no"], correcta: true, nivel: 1, icono: "✋" },
    { palabra: "Gato", silabas: ["ga", "to"], correcta: true, nivel: 1, icono: "🐈" },
    { palabra: "Sopa", silabas: ["so", "pa"], correcta: true, nivel: 1, icono: "🥣" },
    { palabra: "Luna", silabas: ["lu", "na"], correcta: true, nivel: 1, icono: "🌙" },
    { palabra: "Taza", silabas: ["ta", "za"], correcta: true, nivel: 1, icono: "☕" },
    { palabra: "Moto", silabas: ["mo", "to"], correcta: true, nivel: 1, icono: "🏍️" },
    { palabra: "Jugo", silabas: ["ju", "go"], correcta: true, nivel: 1, icono: "🧃" },
    { palabra: "Polo", silabas: ["po", "lo"], correcta: true, nivel: 1, icono: "👕" },
    { palabra: "Beso", silabas: ["be", "so"], correcta: true, nivel: 1, icono: "😘" },
    { palabra: "Oso", silabas: ["o", "so"], correcta: true, nivel: 1, icono: "🐻" },
    { palabra: "Dado", silabas: ["da", "do"], correcta: true, nivel: 1, icono: "🎲" },

    // NIVEL 1: Mal escritas (Para el juego Ojo de Águila / Swipe)
    { palabra: "Sipa", silabas: ["si", "pa"], correcta: false, nivel: 1, icono: "🪑", realRef: "Silla" },
    { palabra: "Sato", silabas: ["sa", "to"], correcta: false, nivel: 1, icono: "🐈", realRef: "Gato" },
    { palabra: "Luma", silabas: ["lu", "ma"], correcta: false, nivel: 1, icono: "🌙", realRef: "Luna" },
    { palabra: "Topa", silabas: ["to", "pa"], correcta: false, nivel: 1, icono: "🥣", realRef: "Sopa" },
    { palabra: "Namo", silabas: ["na", "mo"], correcta: false, nivel: 1, icono: "✋", realRef: "Mano" },
    { palabra: "Cana", silabas: ["ca", "na"], correcta: false, nivel: 1, icono: "🛏️", realRef: "Cama" },

    // NIVEL 2: Reales
    { palabra: "Perro", silabas: ["pe", "rro"], correcta: true, nivel: 2, icono: "🐕" },
    { palabra: "Palta", silabas: ["pal", "ta"], correcta: true, nivel: 2, icono: "🥑" },
    { palabra: "Fiesta", silabas: ["fies", "ta"], correcta: true, nivel: 2, icono: "🎉" },
    { palabra: "Lentes", silabas: ["len", "tes"], correcta: true, nivel: 2, icono: "🕶️" },
    { palabra: "Celular", silabas: ["ce", "lu", "lar"], correcta: true, nivel: 2, icono: "📱" },
    { palabra: "Pastel", silabas: ["pas", "tel"], correcta: true, nivel: 2, icono: "🎂" },
    { palabra: "Árbol", silabas: ["ár", "bol"], correcta: true, nivel: 2, icono: "🌳" },
    { palabra: "Avión", silabas: ["a", "vión"], correcta: true, nivel: 2, icono: "✈️" },

    // NIVEL 2: Mal escritas
    { palabra: "Pelta", silabas: ["pel", "ta"], correcta: false, nivel: 2, icono: "🥑", realRef: "Palta" },
    { palabra: "Fosta", silabas: ["fos", "ta"], correcta: false, nivel: 2, icono: "🎉", realRef: "Fiesta" },
    { palabra: "Lantes", silabas: ["lan", "tes"], correcta: false, nivel: 2, icono: "🕶️", realRef: "Lentes" },
    { palabra: "Pelo", silabas: ["pe", "lo"], correcta: false, nivel: 2, icono: "🐕", realRef: "Perro" },

    // NIVEL 3: Reales
    { palabra: "Postre", silabas: ["pos", "tre"], correcta: true, nivel: 3, icono: "🍰" },
    { palabra: "Dragón", silabas: ["dra", "gón"], correcta: true, nivel: 3, icono: "🐉" },
    { palabra: "Trofeo", silabas: ["tro", "fe", "o"], correcta: true, nivel: 3, icono: "🏆" },
    { palabra: "Estrella", silabas: ["es", "tre", "lla"], correcta: true, nivel: 3, icono: "⭐" },
    { palabra: "Fresa", silabas: ["fre", "sa"], correcta: true, nivel: 3, icono: "🍓" },
    { palabra: "Plátano", silabas: ["plá", "ta", "no"], correcta: true, nivel: 3, icono: "🍌" },
    { palabra: "Libro", silabas: ["li", "bro"], correcta: true, nivel: 3, icono: "📖" },

    // NIVEL 3: Mal escritas
    { palabra: "Prosta", silabas: ["pros", "ta"], correcta: false, nivel: 3, icono: "🍰", realRef: "Postre" },
    { palabra: "Drogán", silabas: ["dro", "gán"], correcta: false, nivel: 3, icono: "🐉", realRef: "Dragón" },
    { palabra: "Fersa", silabas: ["fer", "sa"], correcta: false, nivel: 3, icono: "🍓", realRef: "Fresa" },

    // NIVEL 4: Reales
    { palabra: "Amigas", silabas: ["a", "mi", "gas"], correcta: true, nivel: 4, icono: "👯‍♀️" },
    { palabra: "Corona", silabas: ["co", "ro", "na"], correcta: true, nivel: 4, icono: "👑" },
    { palabra: "Labial", silabas: ["la", "bial"], correcta: true, nivel: 4, icono: "💄" },
    { palabra: "Zapatillas", silabas: ["za", "pa", "ti", "llas"], correcta: true, nivel: 4, icono: "👟" },
    { palabra: "Guitarra", silabas: ["gui", "ta", "rra"], correcta: true, nivel: 4, icono: "🎸" },
    { palabra: "Mariposa", silabas: ["ma", "ri", "po", "sa"], correcta: true, nivel: 4, icono: "🦋" },

    // NIVEL 4: Mal escritas
    { palabra: "Zapatoca", silabas: ["za", "pa", "to", "ca"], correcta: false, nivel: 4, icono: "👟", realRef: "Zapatillas" },
    { palabra: "Maripasa", silabas: ["ma", "ri", "pa", "sa"], correcta: false, nivel: 4, icono: "🦋", realRef: "Mariposa" }
];

// --- FAMILIAS FONÉTICAS PARA EL JUEGO DE SONIDOS Y LETRAS ---
const fonemasLetras = [
    { letra: "A", audio: "Vocal á. Como en Árbol y Avión.", pista: "🌳 Árbol • ✈️ Avión", familia: ["a"] },
    { letra: "E", audio: "Vocal é. Como en Estrella.", pista: "⭐ Estrella • 🪞 Espejo", familia: ["e"] },
    { letra: "I", audio: "Vocal í. Como en Isla.", pista: "🏝️ Isla • 🧲 Imán", familia: ["i"] },
    { letra: "O", audio: "Vocal ó. Como en Oso.", pista: "🐻 Oso • 👀 Ojo", familia: ["o"] },
    { letra: "U", audio: "Vocal ú. Como en Uva.", pista: "🍇 Uva • 💅 Uña", familia: ["u"] },
    { letra: "M", audio: "La letra que suena: má, mé, mí, mó, mú. Como en Mano y Moto.", pista: "✋ Mano • 🏍️ Moto", familia: ["ma", "me", "mi", "mo", "mu"] },
    { letra: "P", audio: "La letra que suena: pá, pé, pí, pó, pú. Como en Polo y Perro.", pista: "👕 Polo • 🐕 Perro", familia: ["pa", "pe", "pi", "po", "pu"] },
    { letra: "S", audio: "La letra que suena: sá, sé, sí, só, sú. Como en Silla y Sopa.", pista: "🪑 Silla • 🥣 Sopa", familia: ["sa", "se", "si", "so", "su"] },
    { letra: "L", audio: "La letra que suena: lá, lé, lí, ló, lú. Como en Luna y Lentes.", pista: "🌙 Luna • 🕶️ Lentes", familia: ["la", "le", "li", "lo", "lu"] },
    { letra: "T", audio: "La letra que suena: tá, té, tí, tó, tú. Como en Taza.", pista: "☕ Taza • 🏆 Trofeo", familia: ["ta", "te", "ti", "to", "tu"] },
    { letra: "D", audio: "La letra que suena: dá, dé, dí, dó, dú. Como en Dado.", pista: "🎲 Dado • 🐉 Dragón", familia: ["da", "de", "di", "do", "du"] },
    { letra: "C", audio: "La letra que suena: ká, kó, kú. Como en Cama y Corona.", pista: "🛏️ Cama • 👑 Corona", familia: ["ca", "co", "cu"] },
    { letra: "B", audio: "La letra que suena: bá, bé, bí, bó, bú. Como en Beso.", pista: "😘 Beso • 🍌 Plátano", familia: ["ba", "be", "bi", "bo", "bu"] },
    { letra: "G", audio: "La letra que suena: gá, gó, gú. Como en Gato.", pista: "🐈 Gato • 🎸 Guitarra", familia: ["ga", "go", "gu"] },
    { letra: "J", audio: "La letra que suena: já, jé, jí, jó, jú. Como en Jugo.", pista: "🧃 Jugo • 🦒 Jirafa", familia: ["ja", "je", "ji", "jo", "ju"] },
    { letra: "F", audio: "La letra que suena: fá, fé, fí, fó, fú. Como en Fiesta y Fresa.", pista: "🎉 Fiesta • 🍓 Fresa", familia: ["fa", "fe", "fi", "fo", "fu"] }
];
