package infrastructure.controller;

import application.dto.request.LoginRequestDTO;
import application.dto.request.ProjectRequestDTO;
import domain.model.ProjectStatus;
import model.integradorsinteclados.IntegradorSinTecladosApplication;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = IntegradorSinTecladosApplication.class)
@AutoConfigureMockMvc
@Transactional
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Criterio 1: POST /auth/login con credenciales validas retorna 200 y token JWT")
    void testLogin_Success() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("admin@test.com", "admin123");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    @DisplayName("Criterio 1: POST /auth/login con credenciales invalidas retorna 401 Unauthorized")
    void testLogin_Failure_InvalidCredentials() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("admin@test.com", "wrongpassword");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @DisplayName("Criterio 2: Acceso Protegido - GET /projects sin cabecera Authorization retorna 403")
    void testGetProjects_NoToken_ShouldBlock() throws Exception {
        mockMvc.perform(get("/projects"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Criterio 3: Acceso Autorizado - POST /projects con token JWT valido permite ejecucion")
    void testCreateProject_WithValidToken_ShouldPassFilter() throws Exception {
        // 1. Obtener token mediante login
        LoginRequestDTO loginRequest = new LoginRequestDTO("admin@test.com", "admin123");
        String responseJson = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String token = objectMapper.readTree(responseJson).get("token").asText();

        // 2. Usar token para POST /projects
        ProjectRequestDTO projectRequest = new ProjectRequestDTO(
                "Proyecto Con Token",
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(30),
                ProjectStatus.PLANNED,
                "Descripcion con token"
        );

        mockMvc.perform(post("/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(projectRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Proyecto Con Token"));
    }
}
