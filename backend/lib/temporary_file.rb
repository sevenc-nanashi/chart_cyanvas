# frozen_string_literal: true
module TemporaryFile
  module_function

  # @param [ActionDispatch::Http::UploadedFile, String] content
  def upload(content)
    host =
      ENV.fetch("HOSTS_SUB_TEMP_STORAGE") do
        raise "HOSTS_SUB_TEMP_STORAGE not set"
      end

    response =
      HTTP.post(
        "#{host}/upload",
        body:
          (
            if content.is_a?(ActionDispatch::Http::UploadedFile)
              content.tempfile
            else
              content
            end
          ),
        headers: {
          "Content-Type" => "application/octet-stream"
        }
      )
    raise "Failed to upload temporary file!" unless response.status.success?

    body = JSON.parse(response.body.to_s, symbolize_names: true)
    raise "Failed to parse response!" unless body[:code] == "ok"

    body[:url]
  end

  def from_url(url)
    host =
      ENV.fetch("HOSTS_SUB_TEMP_STORAGE") do
        raise "HOSTS_SUB_TEMP_STORAGE not set"
      end
    unless url.start_with?(host)
      raise "URL does not match HOSTS_SUB_TEMP_STORAGE (#{host})"
    end
    response = HTTP.head(url)
    unless response.status.success?
      raise "Validation failed for temporary file!"
    end

    url
  end
end
