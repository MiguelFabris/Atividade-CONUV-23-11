package br.com.conuv.crud_vendas.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import br.com.conuv.crud_clientes.entity.Cliente;
import br.com.conuv.crud_clientes.repository.RepositorioClientes;
import br.com.conuv.crud_produtos.entity.Produto;
import br.com.conuv.crud_produtos.repository.RepositorioProdutos;
import br.com.conuv.crud_vendas.entity.Venda;
import br.com.conuv.crud_vendas.repository.RepositorioVendas;

@Service
public class ServicoVendas {
    private RepositorioVendas repositorioVendas;
    private RepositorioClientes repositorioClientes;
    private RepositorioProdutos repositorioProdutos;

    public ServicoVendas(RepositorioVendas repositorioVendas,
            RepositorioClientes repositorioClientes,
            RepositorioProdutos repositorioProdutos) {
        this.repositorioVendas = repositorioVendas;
        this.repositorioClientes = repositorioClientes;
        this.repositorioProdutos = repositorioProdutos;
    }

    public List<Venda> create(Venda venda) {
        associarRegistrosExistentes(venda);
        validarVenda(venda);
        calcularTotal(venda);
        repositorioVendas.save(venda);
        return list();
    }

    public List<Venda> list() {
        Sort sort = Sort.by("dataVenda").descending();
        return repositorioVendas.findAll(sort);
    }

    public List<Venda> update(Venda venda) {
        Venda vendaExistente = repositorioVendas.findById(venda.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venda não encontrada."));
        associarRegistrosExistentes(venda);
        validarVenda(venda);
        calcularTotal(venda);
        repositorioVendas.save(venda);
        return list();
    }

    public List<Venda> delete(Long id) {
        repositorioVendas.deleteById(id);
        return list();
    }

    private void associarRegistrosExistentes(Venda venda) {
        if (venda.getQuantidade() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A quantidade deve ser maior que zero.");
        }

        if (venda.getCliente() == null || venda.getCliente().getId() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione um cliente existente.");
        }

        if (venda.getProduto() == null || venda.getProduto().getId() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione um produto existente.");
        }

        Cliente cliente = repositorioClientes.findById(venda.getCliente().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado."));
        Produto produto = repositorioProdutos.findById(venda.getProduto().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));

        venda.setCliente(cliente);
        venda.setProduto(produto);
    }

    private void calcularTotal(Venda venda) {
        venda.setValorTotal(venda.getProduto().getPreco() * venda.getQuantidade());
    }

    private void validarVenda(Venda venda) {
        if (venda.getDataVenda() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe a data da venda.");
        }

        if (venda.getLoja() == null || venda.getLoja().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe a loja da venda.");
        }

        venda.setLoja(venda.getLoja().trim());
    }
}