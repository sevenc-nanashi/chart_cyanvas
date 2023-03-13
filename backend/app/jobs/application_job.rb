# frozen_string_literal: true
class ApplicationJob < ActiveJob::Base
  # Automatically retry jobs that encountered a deadlock
  # retry_on ActiveRecord::Deadlocked

  # Most jobs are safe to ignore if the underlying records are no longer available
  # discard_on ActiveJob::DeserializationError

  around_perform do |job, block|
    $redis.with do |conn|
      conn.set("job_count", conn.get("job_count").to_i + 1)
      conn.set("total_job_count", conn.get("total_job_count").to_i + 1)
    end
    begin
      block.call
    rescue => e
      Rails.logger.error e
      Rails.logger.error e.backtrace.join("\n")
      $redis.with do |conn|
        conn.set("error_job_count", conn.get("error_job_count").to_i + 1)
      end
    else
      $redis.with do |conn|
        conn.set("success_job_count", conn.get("success_job_count").to_i + 1)
      end
    ensure
      $redis.with do |conn|
        conn.set("job_count", conn.get("job_count").to_i - 1)
      end
    end
  end
end
