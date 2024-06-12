/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />

import { createClient } from "@supabase/supabase-js";
import { type Database } from "types_db";

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
declare global {
  namespace Cypress {
    interface Chainable {
      getCustomers(): Chainable<string>;
    }
  }
}

export const supabaseAdmin = createClient<Database>(
  Cypress.env("NEXT_PUBLIC_SUPABASE_URL") as string,
  Cypress.env("SUPABASE_SERVICE_ROLE") as string,
);

// In order to access DB, we should create tasks
// Tasks allow us access to nodejs runtime
Cypress.Commands.add("getCustomers", () => {
  cy.task("getCustomers", {
    NEXT_PUBLIC_SUPABASE_URL: Cypress.env("NEXT_PUBLIC_SUPABASE_URL") as string,
    SUPABASE_SERVICE_ROLE: Cypress.env("SUPABASE_SERVICE_ROLE") as string,
  });
});

// Create more commands & tasks to create a new user, etc.
