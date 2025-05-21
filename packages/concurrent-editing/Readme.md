This subpackage provides mechanisms to poll for remote changes by 
other users and syncing them into the interface.

Smart filtering makes sure that only unknown changes trigger effects.
F.e. changed/removed assets that were never queried are ignored. 

Currently, only asset related changes are monitored.
Tags and collections are not supported yet.
