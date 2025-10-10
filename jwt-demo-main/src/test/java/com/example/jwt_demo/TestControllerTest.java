package com.example.jwt_demo;

import com.example.jwt_demo.controller.TestController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class TestControllerTest {

    private MockMvc mockMvc;
    private TestController testController;

    @BeforeEach
    void setUp() {
        testController = new TestController();
        mockMvc = MockMvcBuilders.standaloneSetup(testController).build();
    }

    @Test
    void allAccessReturnsPublicContent() throws Exception {
        mockMvc.perform(get("/api/test/all"))
                .andExpect(status().isOk())
                .andExpect(content().string("Public Content."));
    }

    @Test
    void userAccessReturnsUserContent() throws Exception {
        mockMvc.perform(get("/api/test/user"))
                .andExpect(status().isOk())
                .andExpect(content().string("User Content."));
    }
}