const express = require('express');
const multer = require("multer");
const ProdutoController = require('../controllers/produtoController');
const Autenticacao = require('../middlewares/autenticacao');

// Oracle Cloud SDK
const common = require("oci-common");
const os = require("oci-objectstorage");
const provider = new common.ConfigFileAuthenticationDetailsProvider(".oci/config", "DEFAULT");
const client = new os.ObjectStorageClient({ authenticationDetailsProvider: provider });
const namespaceName = "axckoqcwvf2v";
const bucketName = "fotos-produtos";

class ProdutoRoute {
    #router;
    get router() {
        return this.#router;
    }
    set router(router) {
        this.#router = router;
    }

    constructor() {
        this.#router = express.Router();
        const upload = multer();

        let auth = new Autenticacao();
        let ctrl = new ProdutoController();

        this.#router.get('/', auth.usuarioIsAdmin, ctrl.listarView);
        this.#router.get('/cadastro', auth.usuarioIsAdmin, ctrl.cadastroView);
        this.#router.post("/cadastro", auth.usuarioIsAdmin, upload.single("inputImagem"), ctrl.cadastrarProduto);
        this.#router.post("/excluir", auth.usuarioIsAdmin, ctrl.excluirProduto);
        this.#router.get("/alterar/:id", auth.usuarioIsAdmin, ctrl.alterarView);
        this.#router.post("/alterar", auth.usuarioIsAdmin, upload.single("inputImagem"), this.uploadImagemBucket, ctrl.alterarProduto);
        this.#router.post("/buscar", ctrl.buscaProduto);
    }

    async uploadImagemBucket(req, res, next) {
        if (!req.file) return next();

        try {
            const objectName = Date.now().toString() + "_" + req.file.originalname;
            const putObjectRequest = {
                namespaceName,
                bucketName,
                putObjectBody: req.file.buffer,
                objectName
            };
            await client.putObject(putObjectRequest);
            req.body.imagemUrl = `/download/${objectName}`;
            next();
        } catch (error) {
            console.error("Erro ao enviar a imagem para o Bucket:", error);
            res.status(500).send("Erro ao enviar a imagem.");
        }
    }
}

module.exports = ProdutoRoute;
