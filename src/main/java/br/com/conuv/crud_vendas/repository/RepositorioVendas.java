package br.com.conuv.crud_vendas.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.conuv.crud_vendas.entity.Venda;

public interface RepositorioVendas extends JpaRepository<Venda, Long> {
}