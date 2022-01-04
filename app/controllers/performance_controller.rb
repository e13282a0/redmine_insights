class PerformanceController < ApplicationController

  def index
    #@project = Project.find(params[:project_id])

  end

  #todo: generate separate controllers for project and project overview
  #todo: rename routes (index, show, etc..)
  def project
    project_id = params['project_id']
    @project = Project.find(project_id)
    # read all project related time entries
    time_entries = TimeEntry.where( :project_id => @project.id)
   
    #read all top level issues and related time entries
    top_level_issues = Issue.where( :project_id => @project.id, :parent_id => nil)

    # iterate though time beam and build 
    # find first time entry
    start_time_entry = time_entries.min {|a,b| a.spent_on <=> b.spent_on }
    #start_date= start_time_entry.spent_on
    past_weeks = start_time_entry.spent_on.upto(Date.today).count.fdiv(7).ceil
    time_series = []
    time_beam_array = time_beam(past_weeks,0)
    time_beam_array.each_with_index do |time_beam_elm, i|  
      x_axis_index=i
      x_axis_caption=time_beam_elm.strftime("%G-W%V") # maybe remove 'W'??
      x_axis_value=time_beam_elm
      # work through all top level issues
       series = []
       top_level_issues.each_with_index do |issue, j|   
        related_ids = issue.self_and_descendants.pluck(:id).to_a() # get own and all related issue IDs
        related_time_entries = time_entries.where(:issue_id => related_ids)
        serie=Hash.new
        serie["name"] = issue.subject
        serie["val"] = related_time_entries.sum { |a| a.hours }
        series.push(serie)
      end


      puts(series)
    end

    
    # read all project related time entries
    timeEntries = TimeEntry.where( :project_id => @project.id)

    #get involved users
    userIDs = timeEntries.pluck(:user_id).to_a()
    users = User.where(:id => userIDs).to_a()
    @users = users.map{ |user|  {'userID'=>user.id, "userName"=>user.lastname}} 

    

    @time_entries=[]
    topLevelIssues.each do |issue|   
      relatedIDs = issue.self_and_descendants.pluck(:id).to_a() # get own and all related issue IDs
      relatedTimeEntries = timeEntries.where(:issue_id => relatedIDs)
      relatedTimeEntries.each do |timeEntry|
        @time_entries.push({'topLevelID'=>issue.id, 'issueID'=>timeEntry.issue_id, 'userID'=>timeEntry.user_id, 'hours'=>timeEntry.hours, 'comments'=>timeEntry.comments, 'spentOn'=>timeEntry.spent_on, 'week'=>timeEntry.tweek, 'year'=>timeEntry.tyear})
      end
    end

    #issues
    issues = Issue.where(:project_id => @project.id).to_a()
    @issues = issues.map{ |issue| {'issueID'=>issue.id, 'isTopLevel'=>issue.parent_id.nil?,'subject'=> issue.subject, 'tracker' => issue.tracker, 'startDate'=>issue.start_date, 'dueDate'=>issue.due_date, 'estimatedHours'=>issue.estimated_hours, 'closedOn'=>issue.closed_on, 'parentID'=>issue.parent_id, 'spentHours'=>issue.spent_hours, 'totalSpentHours'=>issue.total_spent_hours}}


    #Versions
    versions = Version.where(:project_id => @project.id).to_a()
    @versions = versions.map{|version| {'versionID'=>version.id, 'name'=>version.name, 'effectiveDate'=>version.effective_date, 'status'=>version.status, 'week'=>version.effective_date.cweek, 'year'=>version.effective_date.cwyear}}
  end


  # helper functions
  def moving_average(a, ndays, precision)
    a.each_cons(ndays).map { |e| e.reduce(&:+).fdiv(ndays).round(precision) }
  end

  def time_beam(past_weeks, future_weeks=0)
    result = []
    for i in past_weeks*-1..future_weeks
      result.push(Date.today+(i*7))
    end
    return result
  end

end
