# frozen_string_literal: true
require "securerandom"

class TemporaryFile
  attr_reader :path, :id

  # @param [ActionDispatch::Http::UploadedFile, String] content
  def initialize(content)
    if content.is_a?(String)
      @id = content

      @path = $redis.with { |conn| conn.get("tempfile/#{@id}") }
    else
      @path = Dir.tmpdir + "/chcy-temp-#{SecureRandom.uuid}"
      File.open(@path, "wb") do |file|
        until (buffer = content.read(8192)).nil?
          file.write(buffer)
        end
      end

      @id = SecureRandom.uuid

      $redis.with { |conn| conn.set("tempfile/#{@id}", @path, ex: 60 * 5) }

      Rails.logger.info "TemporaryFile: #{@id} created at #{@path}"
    end
  end

  def url
    "/tempfile/#{@id}"
  end

  def delete
    File.delete(@path)
    $redis.with { |conn| conn.del("tempfile/#{@id}") }
    Rails.logger.info "TemporaryFile: #{@id} deleted"
  end

  def self.find(id)
    new(id)
  end
end
