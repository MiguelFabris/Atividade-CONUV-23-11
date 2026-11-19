package br.com.conuv.crud_clientes.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.conuv.crud_clientes.entity.Cliente;

public interface RepositorioClientes extends JpaRepository<Cliente, Long> {
}