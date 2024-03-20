### Deploy Gate

Deploy Gate is a tool to help you manage your self-hosted environment. 
It is a Node.js based tool aimed at simplifying the complexities involved in setting up and maintaining self-hosted environments.




# Project Name

## Description

This project is a command-line interface (CLI) tool that helps manage your self-hosted environment. It provides functionalities to build a domain on a specific port, delete a domain, and deploy an application.


#### Pre-requisites
- Your Local machine has Ansible installed 
- Install sshpass on your local machine for password authentication 

```

## For Mac
brew install hudochenkov/sshpass/sshpass

## For Ubuntu
sudo apt-get install sshpass

```

- Your local machine has Docker installed with Docker Compose
- Your local machine has a jq installed
- your local machine has an alias for the remote machine , so that you can access the remote machine with a single command
- Make sure you have a domain name configured with NGINX
- Your Target domain is on Ubuntu
- Your Target domain can be accessed via SSH wia passwordless login
- Your Target domain has Docker and Docker Compose installed
- Your Target domain has certbot installed
- Your Target domain has a domain name configured with NGINX




## Installation

To install this CLI tool, run the following command:

```bash
npm install -g deploy-gate
```

## Usage

### Initialize App Config

To set a app config, use the following command:

```bash
deploy-gate init-config 
```


### Update App Config

To update app config, use the following command:

```bash
deploy-gate update-config 
```


### Remove App config
To remove app config
```shell

deploy-gate remove-config 

```


### Build Domain on Port

To build a domain on a specific port, use the following command:

```bash
deploy-gate create_domain --domainName <domain> --redirectPort <port> --enableSSL <true/false>
```

### Delete Domain

To delete a domain, use the following command:

```bash
deploy-gate delete-domain --domainName <domain>
```

### Deploy App

To deploy an application, use the following command:

```bash
deploy-gate deploy-app --port <port> --dockerfile <path-to-dockerfile> --env <path-to-env-file>
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)