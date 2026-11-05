const API_URL = "http://localhost:3000/jogos";

const abrirModal = document.getElementById("abrirModal");
const modalJogo = document.getElementById("modalJogo");
const cancelar = document.getElementById("cancelar");
const formJogo = document.getElementById("formJogo");
const listaJogos = document.getElementById("listaJogos");
const mensagemVazia = document.getElementById("mensagemVazia");

abrirModal.addEventListener("click", () => {
    modalJogo.showModal();
});

cancelar.addEventListener("click", () => {
    modalJogo.close();
});

function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function criarCard(jogo) {
    const card = document.createElement("div");
    card.classList.add("card-jogo");

    const imagem = document.createElement("img");
    imagem.src = jogo.imagem_url;
    imagem.alt = `Capa do jogo ${jogo.titulo}`;

    imagem.onerror = () => {
        imagem.onerror = null;
        imagem.src = "https://placehold.co/400x500?text=Sem+Imagem";
    };

    const info = document.createElement("div");
    info.classList.add("card-info");

    const titulo = document.createElement("h3");
    titulo.textContent = jogo.titulo;

    const plataforma = document.createElement("span");
    plataforma.classList.add("plataforma");
    plataforma.textContent = jogo.plataforma;

    const desenvolvedora = document.createElement("p");
    desenvolvedora.textContent =
        `Desenvolvedora: ${jogo.desenvolvedora}`;

    const preco = document.createElement("div");
    preco.classList.add("preco");
    preco.textContent = formatarPreco(jogo.preco);

    info.appendChild(titulo);
    info.appendChild(plataforma);
    info.appendChild(desenvolvedora);
    info.appendChild(preco);

    card.appendChild(imagem);
    card.appendChild(info);

    return card;
}

async function mostrarJogos() {
    try {
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os jogos.");
        }

        const jogos = await resposta.json();

        listaJogos.innerHTML = "";

        mensagemVazia.style.display =
            jogos.length === 0 ? "block" : "none";

        jogos.forEach(jogo => {
            listaJogos.appendChild(criarCard(jogo));
        });

    } catch (erro) {
        console.error("Erro:", erro);
        listaJogos.innerHTML = "";
        mensagemVazia.style.display = "block";
        mensagemVazia.querySelector("h2").textContent =
            "Erro ao carregar os jogos";
        mensagemVazia.querySelector("p").textContent =
            "Verifique se o servidor está conectado ao banco de dados.";
    }
}

formJogo.addEventListener("submit", async (event) => {
    event.preventDefault();

    const novoJogo = {
        titulo: document.getElementById("titulo").value.trim(),
        plataforma: document.getElementById("plataforma").value,
        desenvolvedora: document.getElementById("desenvolvedora").value.trim(),
        imagem_url: document.getElementById("imagem_url").value.trim(),
        preco: Number(document.getElementById("preco").value)
    };

    try {
        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(novoJogo)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || "Erro ao cadastrar jogo.");
        }

        alert("Jogo cadastrado com sucesso!");

        formJogo.reset();
        modalJogo.close();

        await mostrarJogos();

    } catch (erro) {
        console.error("Erro:", erro);
        alert(erro.message);
    }
});

mostrarJogos();