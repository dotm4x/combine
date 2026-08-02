# Contributing to Combine

Welcome to the **Combine** development ecosystem! We are building a
high-performance, platform-agnostic interface framework, and we appreciate your
interest in contributing. To maintain the high quality and maintainability of
our codebase, please adhere to the following standards.

## Core Development Philosophy

Our primary goal is **clarity**. Code is read much more often than it is
written; therefore, we prioritize readability over brevity.

---

### Coding Standards

1. **No Cryptic Abbreviations:** Never use shorthand or cryptic abbreviations
   (e.g., avoid `i`, `obj`, `cb`, `len`, `ptr`). Always use full, descriptive
   words that clearly state the intent and content of the variable or function
   (e.g., `index`, `object`, `callback`, `length`, `pointer`).
2. **Naming Conventions:** All identifiers must be descriptive. If a variable
   holds a user identifier, name it `userIdentifier`, not `uid`.
3. **Generic Types:** Never use single-letter identifiers for generics (e.g.,
   avoid `T`, `U`, `K`). Always use the suffix `Type` to clearly define the
   intent of the generic parameter (e.g., `ValueType`, `ResultType`,
   `ElementType`).
4. **Visibility Patterns:** Use `camelCase` for all public properties and
   methods. Use an underscore prefix (`_`) followed by `camelCase` for all
   private members (e.g., `publicValue` vs `_privateValue`). This provides
   immediate visual clarity regarding scope.
5. **Minimalist Architecture:** Keep modules focused. A file or module should
   have a single, well-defined responsibility.
6. **Uniformity:** Maintain a consistent structure across all files. If you are
   implementing an interface, ensure the implementation matches the established
   patterns within the repository.

## Documentation Guidelines

Documentation is as critical as the source code. To ensure it remains accessible
and professional:

1. **Clarity and Precision:** Write in clear, concise English. Explain the "how"
   and "why" behind features.
2. **Consistency:** Use descriptive headings and maintain a uniform tone across
   all files.
3. **Examples:** Every major feature or API change must include clear code
   examples to demonstrate proper usage.
4. **Maintenance:** If you modify functionality, you are responsible for
   updating the corresponding documentation immediately. Do not leave "TODO"
   notes in the docs.

## Commit Message Guidelines

We value a clean and informative commit history. Every commit message must be
descriptive and follow this pattern:

- **Format:** `Type: Description of the change`
- **Types:**
- `add`: For new features or functionality.
- `fix`: For bug fixes or patches.
- `refactor`: For code changes that neither fix a bug nor add a feature.
- `documentation`: For changes in documentation.
- `style`: For changes that do not affect the meaning of the code (white-space,
  formatting, etc.).
- `test`: For adding missing tests or correcting existing tests.
- `chore`: For maintenance tasks or updating build tools.

- **Example:** `feat: New validation logic for the class constructor`
- **Avoid:** One-word messages or vague descriptions like "fix," "update," or
  "wip."

## Formatting and Style

- **Automated Formatting:** Before submitting a pull request, ensure your code
  is formatted correctly. We expect consistent indentation and spacing to keep
  the code "pretty" (visually clean and organized).
- **Comments:** Use comments to explain the _why_, not the _what_. If your code
  is descriptive enough, you should rarely need comments to explain what a line
  does.

## Pull Request Process

1. **Branching:** Always create a new branch for your feature or fix.
2. **Review:** All changes will be reviewed by the **Stone Bogus** core team. We
   will check specifically for:

- Adherence to descriptive naming (No abbreviations!).
- Consistency in visibility patterns (public vs private).
- Code modularity and architectural consistency.
- Updated documentation.

3. **Documentation:** If you add a new feature, please update the relevant
   documentation so other developers understand how to use it.

---

Thank you for helping us keep **Quark** clean and professional.
