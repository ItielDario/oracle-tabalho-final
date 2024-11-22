/**
 * Copyright (c) 2020, Oracle and/or its affiliates.  All rights reserved.
 * This software is dual-licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl 
 * or Apache License 2.0 as shown at http://www.apache.org/licenses/LICENSE-2.0. You may choose either license.
 *Código da adaptado por André e Fúlvio (UNOESTE/FIPP)
 */

 const common = require("oci-common");
 const promise = require("es6-promise");
 require("isomorphic-fetch");
 promise.polyfill();
 
  const configurationFilePath = ".oci//config";
 const configProfile = "DEFAULT";
 
 const provider = new common.ConfigFileAuthenticationDetailsProvider(
   configurationFilePath,
   configProfile
 );

 async function ociHttpRequest(uri, method, body = null)  
 {
	try
	{
		// 1. Criar instância de assinatura de requisição
		const signer = new common.DefaultRequestSigner(provider);

		// 2. Criar um HttpRequest para ser assinadado
		const httpRequest = {
			uri,
			headers: new Headers(),
			method
		};

		//2.1 Adiciona o Body, caso necessário.
		if ((method.toUpperCase() == "POST" || method.toUpperCase() == "PUT") && body != null)
		{
			httpRequest.body = JSON.stringify(body);
		}

		// 3. Assinar a requisição. O método signHttpRequest, assina o objeto httpRequest, inserindo os requisitos de segurança necessários para requisitar um EP da API da OCI.
		await signer.signHttpRequest(httpRequest);

		// 4. Criar um novo HttpRequest baseado nos headers com dados da assinatura do httpResquest do passo 2.
		let requestEP = {
			method: method,
			headers: httpRequest.headers,
		}

		if (httpRequest.body)
		{
			requestEP.body = JSON.stringify(body);
		}


		// 5. Requisita, esperar e obtem o resultado do EP.
		const response = await fetch(new Request(httpRequest.uri, requestEP));

		//6. Converte o resultado para um Objeto Literal e retorna para o função que requereu comunicação com a API.
		if (response.body != null)
			return response.json();
		else return null;
	}
	catch (error)	
	{
		console.log(error)
	}

	return null;
 }


// Expondo a função httpRequest para ser usada em outros módulos
module.exports = {
  ociHttpRequest
};
