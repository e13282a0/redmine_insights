class PerformanceController < ApplicationController

  def index
    #@project = Project.find(params[:project_id])

  end

  def project
    @project_id = params['project_id']
    Rails.logger.info "@project: #{@project_id.inspect}"

    @project = Project.find(@project_id)
    Rails.logger.info "@project: #{@project.inspect}"

    @time_entries = TimeEntry.where( :project_id => @project.id)
    Rails.logger.info "@time_entries: #{@time_entries.inspect}"

  end

end
