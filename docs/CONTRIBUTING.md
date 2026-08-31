# Contributing to Z-RevixDB

Thank you for your interest in contributing to Z-RevixDB! We welcome contributions from the community.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/zrevixdb.git
   cd zrevixdb
   ```

3. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and test them:
   ```bash
   python -m unittest discover tests
   ```

3. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add new feature description"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub with a clear description

## Coding Standards

- Follow PEP 8 for Python code
- Add docstrings to all functions and classes
- Write unit tests for new features
- Maintain 100% audit trail logging for sensitive operations

## Running Tests

```bash
# Run all tests
python -m unittest discover tests

# Run specific test file
python -m unittest tests.test_auth

# Run with verbose output
python -m unittest discover tests -v
```

## Documentation

- Update README.md for major changes
- Keep STDLIB.md current with dependencies
- Document new API endpoints in docstrings

## Issues & Bug Reports

- Check existing issues before creating new ones
- Provide detailed reproduction steps
- Include Python version and OS information

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🚀
