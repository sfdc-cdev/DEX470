# Execute in **Mac** using: ./@ELTOROIT/createOrg.sh

echo "*** Creating scratch Org..."
sfdx force:org:create -f config/project-scratch-def.json --setdefaultusername --setalias soBear -d 1
echo "*** Opening scratch Org..."
sfdx force:org:open
echo "*** Pushing metadata to scratch Org..."
sfdx force:source:push
echo "*** Assigning permission set to your user..."
sfdx force:user:permset:assign --permsetname Ursus_Park_User
# echo "*** Creating data using ETCopyData plugin (https://github.com/eltoroit/etcopydata)"
# sfdx ETCopyData:export -c './@ELTOROIT/data' --loglevel trace
# sfdx ETCopyData:import -c './@ELTOROIT/data' --loglevel trace
echo "*** Creating data using sfdx force:data:tree"
sfdx force:data:tree:import -p data/plan.json