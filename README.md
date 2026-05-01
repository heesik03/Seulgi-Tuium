## 📌 Commit Convention

| 타입(Type) | 설명                                | 예시                               |
| -------- | --------------------------------- | -------------------------------- |
| feat     | 새로운 기능 추가                         | feat: 회원가입 API 구현                |
| fix      | 버그 수정                             | fix: 로그인 토큰 만료 오류 수정             |
| docs     | 문서 수정 (README 등)                  | docs: README 설치 방법 추가            |
| style    | 코드 스타일 변경 (포맷팅, 세미콜론 등, 로직 변화 없음) | style: 코드 포맷 정리                  |
| refactor | 리팩토링 (기능 변화 없음)                   | refactor: UserService 로직 분리      |
| test     | 테스트 코드 추가/수정                      | test: 회원가입 테스트 코드 작성             |
| chore    | 빌드, 설정, 패키지 관리                    | chore: eslint 설정 추가              |
| perf     | 성능 개선                             | perf: JPA fetch join 적용으로 N+1 해결 |
| ci       | CI/CD 설정 변경                       | ci: GitHub Actions 빌드 설정 추가      |
| build    | 빌드 관련 설정 수정                       | build: Gradle 의존성 추가             |

---

## 📌 Commit Message Rules

* 형식:

```
타입: 간단한 설명
```

* 예시:

```
feat: JWT 기반 인증 기능 구현
fix: refresh token 재발급 오류 수정
refactor: Controller -> Service 계층 분리

```

---