
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "db_retrogames",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function iniciarServidor() {
    try {
        const conexao = await db.getConnection();
        console.log("MySQL conectado com sucesso!");
        conexao.release();

        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
        });
    } catch (erro) {
        console.error("Erro ao conectar com MySQL:", erro.message);
    }
}

app.get("/jogos", async (req, res) => {
    try {
        const [jogos] = await db.query(
            "SELECT * FROM jogos ORDER BY id DESC"
        );

        res.json(jogos);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao listar jogos." });
    }
});

app.get("/jogos/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ erro: "ID inválido." });
        }

        const [jogos] = await db.query(
            "SELECT * FROM jogos WHERE id = ?",
            [id]
        );

        if (jogos.length === 0) {
            return res.status(404).json({
                erro: "Jogo não encontrado."
            });
        }

        res.json(jogos[0]);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar jogo." });
    }
});

app.post("/jogos", async (req, res) => {
    try {
        const {
            titulo,
            plataforma,
            desenvolvedora,
            imagem_url,
            preco
        } = req.body;

        if (
            !titulo?.trim() ||
            !plataforma?.trim() ||
            !desenvolvedora?.trim() ||
            !imagem_url?.trim() ||
            preco === undefined ||
            preco === null ||
            preco === "" ||
            !Number.isFinite(Number(preco)) ||
            Number(preco) < 0
        ) {
            return res.status(400).json({
                erro: "Preencha todos os campos corretamente."
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO jogos
            (titulo, plataforma, desenvolvedora, imagem_url, preco)
            VALUES (?, ?, ?, ?, ?)`,
            [
                titulo.trim(),
                plataforma.trim(),
                desenvolvedora.trim(),
                imagem_url.trim(),
                Number(preco)
            ]
        );

        res.status(201).json({
            mensagem: "Jogo cadastrado com sucesso!",
            id: resultado.insertId
        });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao cadastrar jogo." });
    }
});

app.put("/jogos/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ erro: "ID inválido." });
        }

        const {
            titulo,
            plataforma,
            desenvolvedora,
            imagem_url,
            preco
        } = req.body;

        if (
            !titulo?.trim() ||
            !plataforma?.trim() ||
            !desenvolvedora?.trim() ||
            !imagem_url?.trim() ||
            preco === undefined ||
            preco === null ||
            preco === "" ||
            !Number.isFinite(Number(preco)) ||
            Number(preco) < 0
        ) {
            return res.status(400).json({
                erro: "Informe todos os campos corretamente."
            });
        }

        const [resultado] = await db.query(
            `UPDATE jogos SET
            titulo = ?,
            plataforma = ?,
            desenvolvedora = ?,
            imagem_url = ?,
            preco = ?
            WHERE id = ?`,
            [
                titulo.trim(),
                plataforma.trim(),
                desenvolvedora.trim(),
                imagem_url.trim(),
                Number(preco),
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                erro: "Jogo não encontrado."
            });
        }

        res.json({ mensagem: "Jogo atualizado com sucesso!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao atualizar jogo." });
    }
});

app.patch("/jogos/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ erro: "ID inválido." });
        }

        const camposPermitidos = [
            "titulo",
            "plataforma",
            "desenvolvedora",
            "imagem_url",
            "preco"
        ];

        const campos = Object.keys(req.body);

        if (
            campos.length === 0 ||
            campos.some(campo => !camposPermitidos.includes(campo))
        ) {
            return res.status(400).json({
                erro: "Informe campos válidos para atualizar."
            });
        }

        const valores = [];
        const atualizacoes = [];

        for (const campo of campos) {
            const valor = req.body[campo];

            if (
                campo === "preco"
                    ? valor === "" || valor === null ||
                      !Number.isFinite(Number(valor)) || Number(valor) < 0
                    : typeof valor !== "string" || !valor.trim()
            ) {
                return res.status(400).json({
                    erro: `Valor inválido para ${campo}.`
                });
            }

            atualizacoes.push(`${campo} = ?`);
            valores.push(
                campo === "preco" ? Number(valor) : valor.trim()
            );
        }

        valores.push(id);

        const [resultado] = await db.query(
            `UPDATE jogos SET ${atualizacoes.join(", ")} WHERE id = ?`,
            valores
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                erro: "Jogo não encontrado."
            });
        }

        res.json({ mensagem: "Jogo atualizado parcialmente!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao atualizar jogo." });
    }
});

app.delete("/jogos/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ erro: "ID inválido." });
        }

        const [resultado] = await db.query(
            "DELETE FROM jogos WHERE id = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                erro: "Jogo não encontrado."
            });
        }

        res.json({ mensagem: "Jogo excluído com sucesso!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao excluir jogo." });
    }
});

iniciarServidor();