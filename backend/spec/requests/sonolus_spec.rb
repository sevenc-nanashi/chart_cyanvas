# frozen_string_literal: true
require "json"
require "base64"
require "rails_helper"
require "openssl"
require "openssl/oaep"

RSpec.describe "Sonolus", type: :request do
  let :secret_key do
    OpenSSL::PKey::RSA.new(
      Rails.root.join("spec/fixtures/files/test_rsa_key").read
    )
  end
  describe "POST /sonolus/authenticate" do
    before do
      stub_const(
        "SonolusController::SONOLUS_PUBLIC_KEY",
        OpenSSL::PKey::RSA.new(
          Rails.root.join("spec/fixtures/files/test_rsa_key.pub").read
        )
      )
    end
    it "returns in right schema" do
      post authenticate_path
      expect(response).to have_http_status(:ok)
      match_schema =
        (
          JSON.parse(response.body, symbolize_names: true) in {
            address: String, session: String, expiration: Integer
          }
        )
      expect(match_schema).to be true
    end

    it "encrypts the session correctly" do
      post authenticate_path

      session = JSON.parse(response.body)["session"]
      session_bytes = Base64.strict_decode64(session)
      decrypted_session = nil
      expect {
        decrypted_session = secret_key.private_decrypt_oaep(session_bytes)
      }.not_to raise_error
      match_schema =
        (
          JSON.parse(decrypted_session, symbolize_names: true) in {
            id: String, key: String, iv: String
          }
        )
      expect(match_schema).to be true
    end
  end
end
