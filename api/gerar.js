export default async function handler(req, res) {
    // Só aceita POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" })
    }

    const { prompt } = req.body

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        return res.status(400).json({ error: "Prompt inválido ou vazio." })
    }

    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
        return res.status(500).json({ error: "API key não configurada no servidor." })
    }

    try {
        const resposta = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "Você é um gerador de código HTML e CSS. Responda SOMENTE com código puro. NUNCA use crases, markdown ou explicações. Formato: primeiro <style> com o CSS, depois o HTML. Siga EXATAMENTE o que o usuário pedir. Se pedir algo quicando, use translateY no @keyframes. Se pedir algo girando, use rotate."
                    },
                    {
                        role: "user",
                        content: prompt.trim()
                    }
                ]
            })
        })

        if (!resposta.ok) {
            const err = await resposta.json().catch(() => ({}))
            return res.status(resposta.status).json({
                error: err?.error?.message || `Erro ${resposta.status} na API Groq.`
            })
        }

        const dados  = await resposta.json()
        const codigo = dados.choices[0].message.content

        return res.status(200).json({ codigo })

    } catch (e) {
        return res.status(500).json({ error: `Erro interno: ${e.message}` })
    }
}
