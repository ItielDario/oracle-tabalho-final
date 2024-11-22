const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json()); // Para analisar application/json
const port = 3000;

const { ociHttpRequest } = require("./ociHttpRequest");
const queueId = "ocid1.queue.oc1.phx.amaaaaaafsrhgwyayqwdrefvrekvnb4ma752njfabhqswef2voelkzdp4dwq";
const queueRegion = "https://cell-1.queue.messaging.us-phoenix-1.oci.oraclecloud.com";

// Configurar EJS como a engine de visualização
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});


app.post('/publicar', async (req, res) => {
   
    const data = req.body;

    const email = data.email;
    const msg = data.msg;

    console.log('email publicado: ')
    console.log(email)
    console.log(msg)
    console.log('------------------------------------')

    const putMessagesRequest = {
        queueId: queueId,
        messages: [ {
            content: JSON.stringify({email, msg})
            }
        ]
     };
     
     let result = await ociHttpRequest(`${queueRegion}/20210201/queues/${queueId}/messages`, "POST", putMessagesRequest)

     console.log(result);
  
    res.status(200).send('Inserido na fila.');
});


app.get('/consumir', async (req, res) => {
    let retorno = await ociHttpRequest(`${queueRegion}/20210201/queues/${queueId}/messages?queueId=${queueId}&limit=10`, "GET");

    if (retorno && retorno.messages) {
        retorno.messages.forEach(async msgFila => {
            try {
                const content = JSON.parse(msgFila.content); // Extrai o JSON do campo `content`
                const email = content.email;
                const msg = content.msg;

                console.log('Email a ser enviado:');
                console.log(email);
                console.log(msg);
                console.log('------------------------------------');

                const receipt = msgFila.receipt;

                // Envia o e-mail
                await enviarEmail("Teste Fila OCI", email, msg);

                // Remove a mensagem da fila
                await ociHttpRequest(`${queueRegion}/20210201/queues/${queueId}/messages/${receipt}`, "DELETE");
            } catch (error) {
                console.error('Erro ao processar a mensagem:', error);

                // Recoloca a mensagem na fila com atraso
                if (msgFila.receipt) {
                    let alteracao = {
                        visibilityInSeconds: 30
                    };
                    await ociHttpRequest(`${queueRegion}/20210201/queues/${queueId}/messages/${msgFila.receipt}`, "PUT", alteracao);
                }
            }
        });
    }

    res.status(200).send('Mensagens processadas.');
});

const enviarEmail = (assunto, destinatario, corpoHtml) => {

    // Configuração do transportador de e-mail
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'itiel.dario@gmail.com', // Seu e-mail
            pass: 'kpdq osow fhtj cohj' // Sua senha ou app password
        }
    });

    // Detalhes do e-mail
    let mailOptions = {
        from: 'itiel.dario@gmail.com', // Endereço de e-mail do remetente
        to: destinatario,
        subject: assunto,
        //text: 'Conteúdo do e-mail em texto simples',
         html: corpoHtml
    };

    // Enviar e-mail
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('E-mail enviado: ' + info.response);
    });

}



app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
