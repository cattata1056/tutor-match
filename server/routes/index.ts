import { Router } from 'express';

import { ensureLoggedIn } from '../config/auth';
import { TutorSession, UserRole } from '../entities';
import { Repositories } from '../repositories';

import * as nav from './nav';
import { filterTimeRange, parseTimeRange } from './timeRange';

function createRouter(repositories: Repositories) {
    const router = Router();

    const { tutorSessions } = repositories;

    router.get(nav.home.href, ensureLoggedIn(nav.home.minimumRole), (req, res) => {
        console.log('user: ', req.user && req.user.displayName);
        res.render('index', nav.locals(req));
    });

    router.param('tutor_session',  (req, res, next, value) => {
        tutorSessions.findOneById(value, { relations: [ 'students' ] })
            .then(session => {
                if (session) {
                    (req as any).tutorSession = session;
                    next();
                } else {
                    res.status(404).send(`tutor_session id "${value}" not found`);
                }
            })
            .catch(err => next(err));
    });

    router.get(nav.tutorSessions.href, ensureLoggedIn(nav.tutorSessions.minimumRole), (req, res, next) => {
        const timeRange = parseTimeRange(req.query.timeRange);
        let query = tutorSessions.createQueryBuilder('session')
            .leftJoinAndSelect('session.tutor', 'tutor')
            .leftJoinAndSelect('session.students', 'students');
        query = filterTimeRange(timeRange, query);
        query.getMany()
            .then(sessions => {
                res.render('tutor_sessions', {
                    ...nav.locals(req),
                    timeRange,
                    sessions,
                });
            }).catch(next);
    });

    router.get(nav.signUpToTutor.href,
        ensureLoggedIn(nav.signUpToTutor.minimumRole), (req, res, next) => {
            res.render('new_tutor_session', nav.locals(req));
        });

    router.get(nav.tutorSessions.href + '/:tutor_session',
        ensureLoggedIn(nav.tutorSessions.minimumRole), (req, res) => {
        const session = (req as any).tutorSession as TutorSession;
        res.render('tutor_session', { ...nav.locals(req), title: session.title, session });
    });

    router.post(nav.tutorSessions.href + '/:tutor_session/sign_up',
        ensureLoggedIn(UserRole.Student), (req, res, next) => {
            const session = (req as any).tutorSession as TutorSession;
            session.students!.push(req.user);
            repositories.tutorSessions.save(session)
                .then(() => { res.redirect(session.url); })
                .catch(next);
        });

    return router;
}

export { createRouter };
