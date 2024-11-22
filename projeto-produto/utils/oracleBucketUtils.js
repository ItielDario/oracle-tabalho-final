const common = require("oci-common");
const os = require("oci-objectstorage");

const provider = new common.ConfigFileAuthenticationDetailsProvider(".oci//config", "DEFAULT");
const client = new os.ObjectStorageClient({ authenticationDetailsProvider: provider });
const namespaceName = "axfyzw7gyrvi"; // Substitua pelo namespace correto
const bucketName = "bucket-atividade-final"; // Substitua pelo nome do bucket correto

async function enviarObjeto(nome, objeto) {
    const putObjectRequest = {
        namespaceName,
        bucketName,
        putObjectBody: objeto,
        objectName: nome
    };
    await client.putObject(putObjectRequest);
}

module.exports = { enviarObjeto };
