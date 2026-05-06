// Elementos
const btnGerar    = document.getElementById("btn-gerar")
const btnCopiar   = document.getElementById("btn-copiar")
const promptInput = document.getElementById("prompt")
const blocoCodigo = document.getElementById("bloco-codigo")
const preview     = document.getElementById("preview")
const resultado   = document.getElementById("resultado")
const erroDiv     = document.getElementById("erro")
const btnText     = btnGerar.querySelector(".btn-gerar__text")
const btnLoading  = btnGerar.querySelector(".btn-gerar__loading")

// Estado de loading
function setLoading(ativo) {
    btnGerar.disabled = ativo
    btnText.hidden    = ativo
    btnLoading.hidden = !ativo
}

// Exibe erro
function mostrarErro(msg) {
    erroDiv.textContent = msg
    erroDiv.hidden = false
}

// Limpa erro
function limparErro() {
    erroDiv.textContent = ""
    erroDiv.hidden = true
}

// Gera o código via API serverless
async function gerarCodigo() {
    const texto = promptInput.value.trim()

    if (!texto) {
        mostrarErro("Por favor, descreva o que você quer gerar antes de clicar.")
        promptInput.focus()
        return
    }

    limparErro()
    setLoading(true)
    resultado.hidden = true

    try {
        const resposta = await fetch("/api/gerar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: texto })
        })

        const dados = await resposta.json()

        if (!resposta.ok) {
            throw new Error(dados.error || `Erro ${resposta.status}`)
        }

        blocoCodigo.textContent = dados.codigo
        preview.srcdoc          = dados.codigo
        resultado.hidden        = false
        resultado.scrollIntoView({ behavior: "smooth", block: "start" })

    } catch (e) {
        mostrarErro(`Algo deu errado: ${e.message}`)
    } finally {
        setLoading(false)
    }
}

// Copiar código
async function copiarCodigo() {
    const codigo = blocoCodigo.textContent
    if (!codigo) return

    try {
        await navigator.clipboard.writeText(codigo)
        btnCopiar.classList.add("btn-copiar--copiado")
        btnCopiar.querySelector("span").textContent = "Copiado!"
        setTimeout(() => {
            btnCopiar.classList.remove("btn-copiar--copiado")
            btnCopiar.querySelector("span").textContent = "Copiar"
        }, 2000)
    } catch {
        mostrarErro("Não foi possível copiar. Selecione o código manualmente.")
    }
}

// Eventos
btnGerar.addEventListener("click", gerarCodigo)
btnCopiar.addEventListener("click", copiarCodigo)

// Gerar com Ctrl+Enter / Cmd+Enter
promptInput.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        gerarCodigo()
    }
})
