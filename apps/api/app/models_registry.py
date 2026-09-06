"""
Imports every module's models so Base.metadata is fully populated in
one place, for Alembic's autogenerate (see migrations/env.py) and for
create_all in tests. Nothing here is business logic; it exists purely
so importing this one module is enough to register the whole schema,
without migrations/env.py needing to know the module list itself.
"""

from app.modules.admin import models as admin_models  # noqa: F401
from app.modules.auth import models as auth_models  # noqa: F401
from app.modules.inspections import models as inspections_models  # noqa: F401
from app.modules.locations import models as locations_models  # noqa: F401
from app.modules.media import models as media_models  # noqa: F401
from app.modules.messaging import models as messaging_models  # noqa: F401
from app.modules.notifications import models as notifications_models  # noqa: F401
from app.modules.payments import models as payments_models  # noqa: F401
from app.modules.properties import models as properties_models  # noqa: F401
from app.modules.reports import models as reports_models  # noqa: F401
from app.modules.users import models as users_models  # noqa: F401
from app.modules.verification import models as verification_models  # noqa: F401
