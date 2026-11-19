package br.com.conuv;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "br.com.conuv")
@EnableJpaRepositories(basePackages = "br.com.conuv")
public class CrudProdutosApplication {

	public static void main(String[] args) {
		SpringApplication.run(CrudProdutosApplication.class, args);
	}

}
