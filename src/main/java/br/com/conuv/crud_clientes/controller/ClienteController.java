package br.com.conuv.crud_clientes.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.conuv.crud_clientes.entity.Cliente;
import br.com.conuv.crud_clientes.service.ServicoClientes;

@RestController
@RequestMapping("/clientes")
public class ClienteController {
    private ServicoClientes servicoClientes;

    public ClienteController(ServicoClientes servicoClientes) {
        this.servicoClientes = servicoClientes;
    }

    @PostMapping
    List<Cliente> create(@RequestBody Cliente cliente) {
        return servicoClientes.create(cliente);
    }

    @GetMapping
    List<Cliente> list() {
        return servicoClientes.list();
    }

    @PutMapping
    List<Cliente> update(@RequestBody Cliente cliente) {
        return servicoClientes.update(cliente);
    }

    @DeleteMapping("{id}")
    List<Cliente> delete(@PathVariable("id") Long id) {
        return servicoClientes.delete(id);
    }
}