class PerformanceController < ApplicationController

  def index
    #@project = Project.find(params[:project_id])

  end

  def project
    projectID = params['project_id']
    @project = Project.find(projectID)
    # read all project related time entries
    timeEntries = TimeEntry.where( :project_id => @project.id)

    #get involved users
    userIDs = timeEntries.pluck(:user_id).to_a()
    users = User.where(:id => userIDs).to_a()
    @users = users.map{ |user|  {'userID'=>user.id, "userName"=>user.lastname}}

    #read all top level issues and related time entries
    topLevelIssues = Issue.where( :project_id => @project.id, :parent_id => nil)

    @time_entries=[]
    topLevelIssues.each do |issue|   
      relatedIDs = issue.self_and_descendants.pluck(:id).to_a() # get own and all related issue IDs
      relatedTimeEntries = timeEntries.where(:issue_id => relatedIDs)
      relatedTimeEntries.each do |timeEntry|
        @time_entries.push({'topLevelID'=>issue.id, 'issueID'=>timeEntry.issue_id, 'userID'=>timeEntry.user_id, 'hours'=>timeEntry.hours, 'comments'=>timeEntry.comments, 'spentOn'=>timeEntry.spent_on, 'week'=>timeEntry.tweek, 'year'=>timeEntry.tyear})
      end
    end

    #issues
    issues = Issue.where( :project_id => @project.id).to_a()
    @issues = issues.map{ |issue| {'issueID'=>issue.id, 'isTopLevel'=>issue.parent_id.nil?,'subject'=> issue.subject, 'tracker' => issue.tracker, 'startDate'=>issue.start_date, 'dueDate'=>issue.due_date, 'estimatedHours'=>issue.estimated_hours, 'closedOn'=>issue.closed_on}}


  end
end
