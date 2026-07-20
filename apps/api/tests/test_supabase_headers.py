from bighead_pycore import supabase_admin_headers


def test_hosted_opaque_secret_is_only_sent_as_api_key() -> None:
    secret_key = "sb_" + "secret_hosted-example"

    assert supabase_admin_headers(secret_key) == {"apikey": secret_key}


def test_legacy_service_role_jwt_remains_a_bearer_token() -> None:
    service_role_jwt = "eyJhbGciOiJIUzI1NiJ9.payload.signature"

    assert supabase_admin_headers(service_role_jwt) == {
        "apikey": service_role_jwt,
        "Authorization": f"Bearer {service_role_jwt}",
    }
