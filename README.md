# cashbackboticario
Desafio CashBack Boticário

## Instalação

### Dependências
É necessário ter o node.js instalado.

A versão utilizada no projeto foi a 12.

Pode-se instalar através do [NVM](https://github.com/nvm-sh/nvm)
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

```

Após instalar o nvm, instalar a versão 12 do node.js e o yarn
```
nvm install 12
nvm use 12
npm install -g yarn
```

Para instalar as dependências do projeto rodar o comando a seguir na pasta raiz.
```
yarn
```

## Testes Unitários e de integração
Para rodar os testes, na pasta raiz do projeto rodar o comando:
```
yarn test
```
Um relatório da cobertura de testes será criado na pasta coverage

## Iniciando a aplicação
Para iniciar a aplicação deve-se rodar o comando
```
yarn start
```

Um servidor será iniciado na porta 9090 onde:
- Os endpoints da api estão disponíveis no caminho `http://localhost:9090/api`
- A documentação da api está disponível no caminho `http://localhost:9090/swagger`
