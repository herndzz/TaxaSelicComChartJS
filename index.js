// Importa os módulos necessários
const express = require('express'); // Express é um framework para Node.js que facilita a criação de servidores web.
const axios = require('axios');     // Axios é uma biblioteca para fazer requisições HTTP, muito usada para obter dados de APIs.

// Cria uma instância do Express
const app = express();
const port = 3000; // Define a porta na qual o servidor vai escutar. 3000 é uma porta comum para desenvolvimento local.

// Configura o Express para servir arquivos estáticos da pasta "public"
app.use(express.static('public'));

// Função para filtrar os dados dos últimos 12 meses
function filtrarUltimos12Meses(dados) {
    // Obtém a data atual
    const dataAtual = new Date();
    
    // Calcula a data limite (12 meses atrás)
    const dataLimite = new Date(dataAtual.setMonth(dataAtual.getMonth() - 12));

    // Filtra os dados para incluir apenas os registros dentro dos últimos 12 meses
    return dados.filter(dado => {
        // A API retorna a data no formato dd/mm/yyyy. Aqui, convertemos para yyyy-mm-dd para facilitar a comparação.
        const dataDado = new Date(dado.data.split('/').reverse().join('-'));
        
        // Retorna apenas os dados cuja data é posterior ou igual à data limite.
        return dataDado >= dataLimite;
    });
}

// Define uma rota que fornece dados da Selic e IPCA
app.get('/api/dados', async (req, res) => {
    try {
        // Faz uma requisição para a API do Banco Central para obter os dados da Selic
        const responseSelic = await axios.get('https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?formato=json');
        
        // Filtra os dados da Selic para incluir apenas os últimos 12 meses
        const dadosSelic = filtrarUltimos12Meses(responseSelic.data);

        // Faz uma requisição para a API do Banco Central para obter os dados do IPCA
        const responseIpca = await axios.get('https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json');
        
        // Filtra os dados do IPCA para incluir apenas os últimos 12 meses
        const dadosIpca = filtrarUltimos12Meses(responseIpca.data);

        // Envia a resposta em formato JSON contendo os dados da Selic e do IPCA
        res.json({ selic: dadosSelic, ipca: dadosIpca });
    } catch (error) {
        // Em caso de erro na obtenção dos dados, envia uma resposta de erro 500 (erro interno do servidor)
        res.status(500).send('Erro ao obter dados');
    }
});

// Inicia o servidor na porta especificada (3000) e exibe uma mensagem no console
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
